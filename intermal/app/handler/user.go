package handler

import (
	"fmt"
	"net/http"

	"Lab1/intermal/app/middleware"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// GetUserProfileAPI godoc
// @Summary Получить профиль пользователя
// @Description Получение данных профиля текущего авторизованного пользователя
// @Tags user
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} map[string]interface{} "success"
// @Failure 401 {object} map[string]interface{} "error"
// @Router /api/user/profile [get]
func (h *Handler) GetUserProfileAPI(ctx *gin.Context) {
	// Получаем UUID пользователя из контекста
	userUUIDStr, exists := middleware.GetUserUUID(ctx)
	if !exists {
		h.errorHandler(ctx, http.StatusUnauthorized, fmt.Errorf("user UUID not found in context"))
		return
	}

	userUUID, err := uuid.Parse(userUUIDStr)
	if err != nil {
		h.errorHandler(ctx, http.StatusInternalServerError, fmt.Errorf("invalid user UUID"))
		return
	}

	user, err := h.Repository.GetUserByUUID(userUUID)
	if err != nil {
		h.errorHandler(ctx, http.StatusNotFound, fmt.Errorf("user not found"))
		return
	}

	// Не возвращаем пароль
	ctx.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data": gin.H{
			"uuid": user.UUID,
			"name": user.Name,
			"role": user.Role,
		},
	})
}

// UpdateUserProfileAPI godoc
// @Summary Обновить профиль пользователя
// @Description Обновление данных профиля текущего авторизованного пользователя (имя, пароль)
// @Tags user
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param profile body object{name=string,password=string} true "Обновленные данные профиля"
// @Success 200 {object} map[string]interface{} "success"
// @Failure 400 {object} map[string]interface{} "error"
// @Failure 401 {object} map[string]interface{} "error"
// @Router /api/user/profile [put]
func (h *Handler) UpdateUserProfileAPI(ctx *gin.Context) {
	// Получаем UUID пользователя из контекста
	userUUIDStr, exists := middleware.GetUserUUID(ctx)
	if !exists {
		h.errorHandler(ctx, http.StatusUnauthorized, fmt.Errorf("user UUID not found in context"))
		return
	}

	userUUID, err := uuid.Parse(userUUIDStr)
	if err != nil {
		h.errorHandler(ctx, http.StatusInternalServerError, fmt.Errorf("invalid user UUID"))
		return
	}

	var updateData struct {
		Name     string `json:"name"`
		Password string `json:"password"`
	}

	if err := ctx.ShouldBindJSON(&updateData); err != nil {
		h.errorHandler(ctx, http.StatusBadRequest, fmt.Errorf("invalid JSON: %v", err))
		return
	}

	// Получаем текущего пользователя
	user, err := h.Repository.GetUserByUUID(userUUID)
	if err != nil {
		h.errorHandler(ctx, http.StatusNotFound, fmt.Errorf("user not found"))
		return
	}

	// Обновляем поля если они переданы
	if updateData.Name != "" {
		user.Name = updateData.Name
	}
	if updateData.Password != "" {
		user.Pass = generateHashString(updateData.Password)
	}

	err = h.Repository.UpdateUser(user)
	if err != nil {
		h.errorHandler(ctx, http.StatusInternalServerError, fmt.Errorf("failed to update user: %v", err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Profile updated successfully",
	})
}
