package pkg

import (
	"Lab1/intermal/app/config"
	"Lab1/intermal/app/ds"
	"Lab1/intermal/app/handler"
	"Lab1/intermal/app/redis"
	"Lab1/intermal/app/role"
	"errors"
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt"
	"github.com/sirupsen/logrus"
)

type Application struct {
	Config  *config.Config
	Router  *gin.Engine
	Handler *handler.Handler
	Redis   *redis.Client
}

func NewApp(c *config.Config, r *gin.Engine, h *handler.Handler, redisClient *redis.Client) *Application {
	return &Application{
		Config:  c,
		Router:  r,
		Handler: h,
		Redis:   redisClient,
	}
}

const jwtPrefix = "Bearer "

func (a *Application) WithAuthCheck(assignedRoles ...interface{}) gin.HandlerFunc {
	// Преобразуем interface{} в role.Role
	roles := make([]role.Role, len(assignedRoles))
	for i, r := range assignedRoles {
		if roleVal, ok := r.(role.Role); ok {
			roles[i] = roleVal
		}
	}

	return a.withAuthCheckInternal(roles...)
}

func (a *Application) withAuthCheckInternal(assignedRoles ...role.Role) func(ctx *gin.Context) {
	return func(gCtx *gin.Context) {
		log.Printf("[AUTH] Starting auth check for path: %s", gCtx.Request.URL.Path)

		jwtStr := gCtx.GetHeader("Authorization")
		if !strings.HasPrefix(jwtStr, jwtPrefix) { // если нет префикса то нас дурят!
			log.Printf("[AUTH] Missing or invalid Authorization header")
			gCtx.AbortWithStatus(http.StatusForbidden) // отдаем что нет доступа
			return                                     // завершаем обработку
		}

		// отрезаем префикс
		jwtStr = jwtStr[len(jwtPrefix):]
		tokenPreview := jwtStr
		if len(tokenPreview) > 20 {
			tokenPreview = tokenPreview[:20] + "..."
		}
		log.Printf("[AUTH] JWT token received: %s", tokenPreview)

		// проверяем jwt в блеклист редиса
		err := a.Redis.CheckJWTInBlacklist(gCtx.Request.Context(), jwtStr)
		if err == nil { // значит что токен в блеклисте
			log.Printf("[AUTH] Token is in blacklist")
			gCtx.AbortWithStatus(http.StatusForbidden)
			return
		}
		if !errors.Is(err, redis.Nil) { // значит что это не ошибка отсутствия - внутренняя ошибка
			log.Printf("[AUTH] Redis error: %v", err)
			gCtx.AbortWithError(http.StatusInternalServerError, err)
			return
		}

		token, err := jwt.ParseWithClaims(jwtStr, &ds.JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
			return []byte(a.Config.JWT.Token), nil
		})
		if err != nil {
			log.Printf("[AUTH] JWT parse error: %v", err)
			gCtx.AbortWithStatus(http.StatusForbidden)
			return
		}

		myClaims := token.Claims.(*ds.JWTClaims)
		log.Printf("[AUTH] Token parsed successfully, UserUUID: %s, Role: %d", myClaims.UserUUID, myClaims.Role)

		// Сохраняем данные пользователя в контекст для использования в хэндлерах
		gCtx.Set("user_uuid", myClaims.UserUUID)
		gCtx.Set("user_role", myClaims.Role)

		// Проверяем, есть ли роль пользователя среди разрешенных
		hasAccess := false
		for _, oneOfAssignedRole := range assignedRoles {
			if myClaims.Role == oneOfAssignedRole {
				hasAccess = true
				break
			}
		}

		if !hasAccess {
			log.Printf("[AUTH] Access denied: role %d is not assigned, required one of: %v", myClaims.Role, assignedRoles)
			gCtx.AbortWithStatus(http.StatusForbidden)
			return
		}

		log.Printf("[AUTH] Access granted for role %d", myClaims.Role)
		// Роль подходит, продолжаем обработку
		gCtx.Next()
	}
}

func (a *Application) RunApp() {
	logrus.Info("Server start up")

	// Регистрируем ping с проверкой ролей (для тестирования)
	// Доступен только для Модератора (Researcher = 0, Moderator = 1)
	a.Router.GET("/ping", a.withAuthCheckInternal(role.Moderator), a.Handler.Ping)

	a.Handler.RegisterSwagger(a.Router)
	a.Handler.RegisterAPI(a.Router)
	a.Handler.RegisterStatic(a.Router)

	serverAddress := fmt.Sprintf("%s:%d", a.Config.ServiceHost, a.Config.ServicePort)
	if err := a.Router.Run(serverAddress); err != nil {
		logrus.Fatal(err)
	}

	logrus.Info("Server down")
}
