package handler

import (
	"Lab1/intermal/app/ds"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt"
)

type loginReq struct {
	Login    string `json:"login" example:"max"`
	Password string `json:"password" example:"123"`
}

type loginResp struct {
	ExpiresIn   int    `json:"expires_in" example:"3600000000000"`
	AccessToken string `json:"access_token" example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`
	TokenType   string `json:"token_type" example:"Bearer"`
}

// Login godoc
// @Summary Вход пользователя
// @Description Аутентификация пользователя и получение JWT токена
// @Tags auth
// @Accept json
// @Produce json
// @Param request body loginReq true "Данные для входа"
// @Success 200 {object} loginResp
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Router /login [post]
func (h *Handler) Login(gCtx *gin.Context) {
	cfg := h.Config
	req := &loginReq{}

	err := gCtx.ShouldBindJSON(&req)
	if err != nil {
		gCtx.AbortWithError(http.StatusBadRequest, err)
		return
	}

	user, err := h.Repository.GetUserByLogin(req.Login)
	if err != nil {
		gCtx.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	if req.Login == user.Name && user.Pass == generateHashString(req.Password) {
		// значит проверка пройдена
		// генерируем ему jwt
		token := jwt.NewWithClaims(jwt.GetSigningMethod(cfg.JWT.SigningMethod), &ds.JWTClaims{
			StandardClaims: jwt.StandardClaims{
				ExpiresAt: time.Now().Add(time.Duration(cfg.JWT.ExpiresIn)).Unix(),
				IssuedAt:  time.Now().Unix(),
				Issuer:    "bitop-admin",
			},
			UserUUID: user.UUID, // используем реальный UUID
			Role:     user.Role,
		})
		if token == nil {
			gCtx.AbortWithError(http.StatusInternalServerError, err)
			return
		}

		strToken, err := token.SignedString([]byte(cfg.JWT.Token))
		if err != nil {
			gCtx.AbortWithError(http.StatusInternalServerError, err)
			return
		}

		gCtx.JSON(http.StatusOK, loginResp{
			ExpiresIn:   cfg.JWT.ExpiresIn,
			AccessToken: strToken,
			TokenType:   "Bearer",
		})
		return
	}

	gCtx.AbortWithStatus(http.StatusForbidden) // отдаем 403 ответ в знак того что доступ запрещен
}

