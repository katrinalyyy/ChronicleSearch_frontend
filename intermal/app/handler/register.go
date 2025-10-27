package handler

import (
	"Lab1/intermal/app/ds"
	"Lab1/intermal/app/role"
	"crypto/sha1"
	"encoding/hex"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type registerReq struct {
	Name string `json:"name" example:"testuser"`
	Pass string `json:"pass" example:"password123"`
}

type registerResp struct {
	Ok bool `json:"ok" example:"true"`
}

// Register godoc
// @Summary Регистрация нового пользователя
// @Description Создание нового пользователя с ролью Исследователь
// @Tags auth
// @Accept json
// @Produce json
// @Param request body registerReq true "Данные для регистрации"
// @Success 200 {object} registerResp
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /sign_up [post]
func (h *Handler) Register(gCtx *gin.Context) {
	req := &registerReq{}

	err := gCtx.ShouldBindJSON(&req)
	if err != nil {
		gCtx.AbortWithError(http.StatusBadRequest, err)
		return
	}

	if req.Pass == "" {
		gCtx.AbortWithError(http.StatusBadRequest, fmt.Errorf("pass is empty"))
		return
	}

	if req.Name == "" {
		gCtx.AbortWithError(http.StatusBadRequest, fmt.Errorf("name is empty"))
		return
	}

	err = h.Repository.Register(&ds.User{
		UUID: uuid.New(),
		Role: role.Researcher,
		Name: req.Name,
		Pass: generateHashString(req.Pass), // пароли делаем в хешированном виде и далее будем сравнивать хеш, чтобы их не утянули
	})
	if err != nil {
		gCtx.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	gCtx.JSON(http.StatusOK, &registerResp{
		Ok: true,
	})
}

func generateHashString(s string) string {
	h := sha1.New()
	h.Write([]byte(s))
	return hex.EncodeToString(h.Sum(nil))
}
