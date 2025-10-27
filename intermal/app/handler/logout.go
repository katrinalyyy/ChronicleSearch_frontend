package handler

import (
	"Lab1/intermal/app/ds"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt"
)

// Logout godoc
// @Summary Выход пользователя
// @Description Добавление JWT токена в блеклист (logout)
// @Tags auth
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Router /logout [post]
func (h *Handler) Logout(gCtx *gin.Context) {
	// получаем заголовок
	jwtStr := gCtx.GetHeader("Authorization")
	if !strings.HasPrefix(jwtStr, "Bearer ") { // если нет префикса то нас дурят!
		gCtx.AbortWithStatus(http.StatusBadRequest) // отдаем что нет доступа
		return                                      // завершаем обработку
	}

	// отрезаем префикс
	jwtStr = jwtStr[len("Bearer "):]

	// ПРОВЕРЯЕМ, не в блеклисте ли уже токен
	err := h.RedisClient.CheckJWTInBlacklist(gCtx.Request.Context(), jwtStr)
	if err == nil { // значит токен УЖЕ в блеклисте
		gCtx.AbortWithStatus(http.StatusForbidden)
		return
	}

	_, err = jwt.ParseWithClaims(jwtStr, &ds.JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(h.Config.JWT.Token), nil
	})
	if err != nil {
		gCtx.AbortWithError(http.StatusBadRequest, err)
		log.Println(err)
		return
	}

	// сохраняем в блеклист редиса
	err = h.RedisClient.WriteJWTToBlacklist(gCtx.Request.Context(), jwtStr, time.Duration(h.Config.JWT.ExpiresIn))
	if err != nil {
		gCtx.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	gCtx.Status(http.StatusOK)
}

