package handler

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"Lab1/intermal/app/ds"
	"Lab1/intermal/app/middleware"
	"Lab1/intermal/app/role"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func (h *Handler) GetDraftRequestInfoAPI(ctx *gin.Context) {
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

	requestID, count, err := h.Repository.GetDraftRequestInfo(userUUID)
	if err != nil {
		h.errorHandler(ctx, http.StatusInternalServerError, err)
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"status":     "success",
		"request_id": requestID,
		"count":      count,
	})
}

// GetRequestChronicleResearchAPI godoc
// @Summary Получить список заявок
// @Description Получить список заявок (для пользователя - только свои, для модератора - все)
// @Tags ChronicleRequestList
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param status query string false "Фильтр по статусу"
// @Param start_date query string false "Дата начала (YYYY-MM-DD)"
// @Param end_date query string false "Дата окончания (YYYY-MM-DD)"
// @Success 200 {object} map[string]interface{} "success"
// @Failure 401 {object} map[string]interface{} "error"
// @Router /api/ChronicleRequestList [get]
func (h *Handler) GetRequestChronicleResearchAPI(ctx *gin.Context) {
	var startDate, endDate *time.Time
	status := ctx.Query("status")

	if startDateStr := ctx.Query("start_date"); startDateStr != "" {
		if parsed, err := time.Parse("2006-01-02", startDateStr); err == nil {
			startDate = &parsed
		}
	}

	if endDateStr := ctx.Query("end_date"); endDateStr != "" {
		if parsed, err := time.Parse("2006-01-02", endDateStr); err == nil {
			endDate = &parsed
		}
	}

	// Получаем UUID пользователя из контекста (для JWT)
	userUUID, exists := middleware.GetUserUUID(ctx)
	if !exists {
		h.errorHandler(ctx, http.StatusUnauthorized, fmt.Errorf("user not authenticated"))
		return
	}

	// Получаем роль пользователя из контекста
	userRole, exists := middleware.GetUserRole(ctx)
	if !exists {
		h.errorHandler(ctx, http.StatusUnauthorized, fmt.Errorf("user role not found"))
		return
	}

	// Проверяем, является ли пользователь модератором (Moderator role = 1)
	isModerator := userRole == int(role.Moderator)

	// Если не модератор - показываем только его заявки
	var requests []ds.RequestChronicleResearch
	var err error

	if isModerator {
		// Модератор видит все заявки
		requests, err = h.Repository.GetRequestChronicleResearch(status, startDate, endDate)
	} else {
		// Обычный пользователь видит только свои заявки
		requests, err = h.Repository.GetRequestChronicleResearchByCreator(userUUID, status, startDate, endDate)
	}

	if err != nil {
		h.errorHandler(ctx, http.StatusInternalServerError, err)
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   requests,
	})
}

func (h *Handler) GetRequestWithChroniclesAPI(ctx *gin.Context) {
	idStr := ctx.Param("id_chronicle_request")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		h.errorHandler(ctx, http.StatusBadRequest, fmt.Errorf("invalid ID format"))
		return
	}

	request, chronicles, err := h.Repository.GetRequestWithChronicles(uint(id))
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			h.errorHandler(ctx, http.StatusNotFound, err)
		} else {
			h.errorHandler(ctx, http.StatusInternalServerError, err)
		}
		return
	}

	// Очищаем детальные поля из chronicle_resource для краткого представления
	for i := range chronicles {
		chronicles[i].ChronicleResource.DetailedDescription = ""
		chronicles[i].ChronicleResource.DetailedSignificance = ""
		chronicles[i].ChronicleResource.DetailedEditions = ""
	}

	ctx.JSON(http.StatusOK, gin.H{
		"status":     "success",
		"request":    request,
		"chronicles": chronicles,
	})
}

func (h *Handler) UpdateRequestChronicleResearchAPI(ctx *gin.Context) {
	idStr := ctx.Param("id_chronicle_request")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		h.errorHandler(ctx, http.StatusBadRequest, fmt.Errorf("invalid ID format"))
		return
	}

	var request ds.RequestChronicleResearch
	if err := ctx.ShouldBindJSON(&request); err != nil {
		h.errorHandler(ctx, http.StatusBadRequest, fmt.Errorf("invalid JSON: %v", err))
		return
	}

	err = h.Repository.UpdateRequestChronicleResearch(uint(id), request)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			h.errorHandler(ctx, http.StatusNotFound, err)
		} else {
			h.errorHandler(ctx, http.StatusInternalServerError, err)
		}
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Request updated successfully",
	})
}

func (h *Handler) FormRequestChronicleResearchAPI(ctx *gin.Context) {
	idStr := ctx.Param("id_chronicle_request")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		h.errorHandler(ctx, http.StatusBadRequest, fmt.Errorf("invalid ID format"))
		return
	}

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

	err = h.Repository.FormRequestChronicleResearch(uint(id), userUUID)
	if err != nil {
		if strings.Contains(err.Error(), "not found") || strings.Contains(err.Error(), "cannot be formed") ||
			strings.Contains(err.Error(), "доступен только черновик") || strings.Contains(err.Error(), "заявка пуста") ||
			strings.Contains(err.Error(), "необходимо заполнить") {
			h.errorHandler(ctx, http.StatusBadRequest, err)
		} else {
			h.errorHandler(ctx, http.StatusInternalServerError, err)
		}
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Request formed successfully",
	})
}

// CompleteOrRejectRequestChronicleResearchAPI godoc
// @Summary Завершить или отклонить заявку
// @Description Завершение или отклонение заявки (только для модератора)
// @Tags ChronicleRequestList
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id_chronicle_request path integer true "ID заявки"
// @Param action body object{action=string} true "Действие: complete или reject"
// @Success 200 {object} map[string]interface{} "success"
// @Failure 400 {object} map[string]interface{} "error"
// @Failure 403 {object} map[string]interface{} "error - не модератор"
// @Router /api/ChronicleRequestList/{id_chronicle_request}/chronicle_complete-or-reject [put]
func (h *Handler) CompleteOrRejectRequestChronicleResearchAPI(ctx *gin.Context) {
	idStr := ctx.Param("id_chronicle_request")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		h.errorHandler(ctx, http.StatusBadRequest, fmt.Errorf("invalid ID format"))
		return
	}

	// Получаем UUID модератора из контекста
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

	var requestBody struct {
		Action string `json:"action" binding:"required"` // "complete" или "reject"
	}

	if err := ctx.ShouldBindJSON(&requestBody); err != nil {
		h.errorHandler(ctx, http.StatusBadRequest, fmt.Errorf("invalid JSON: %v", err))
		return
	}

	switch requestBody.Action {
	case "complete":
		err = h.Repository.CompleteRequestChronicleResearch(uint(id), userUUID)
		if err != nil {
			if strings.Contains(err.Error(), "not found") || strings.Contains(err.Error(), "cannot be completed") {
				h.errorHandler(ctx, http.StatusBadRequest, err)
			} else {
				h.errorHandler(ctx, http.StatusInternalServerError, err)
			}
			return
		}
		ctx.JSON(http.StatusOK, gin.H{
			"status":  "success",
			"message": "Request completed successfully",
		})
	case "reject":
		err = h.Repository.RejectRequestChronicleResearch(uint(id), userUUID)
		if err != nil {
			if strings.Contains(err.Error(), "not found") || strings.Contains(err.Error(), "cannot be rejected") {
				h.errorHandler(ctx, http.StatusBadRequest, err)
			} else {
				h.errorHandler(ctx, http.StatusInternalServerError, err)
			}
			return
		}
		ctx.JSON(http.StatusOK, gin.H{
			"status":  "success",
			"message": "Request rejected successfully",
		})
	default:
		h.errorHandler(ctx, http.StatusBadRequest, fmt.Errorf("invalid action. Use 'complete' or 'reject'"))
	}
}

func (h *Handler) DeleteRequestChronicleResearchAPI(ctx *gin.Context) {
	idStr := ctx.Param("id_chronicle_request")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		h.errorHandler(ctx, http.StatusBadRequest, fmt.Errorf("invalid ID format"))
		return
	}

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

	err = h.Repository.DeleteRequestChronicleResearch(uint(id), userUUID)
	if err != nil {
		if strings.Contains(err.Error(), "not found") || strings.Contains(err.Error(), "cannot be deleted") {
			h.errorHandler(ctx, http.StatusBadRequest, err)
		} else {
			h.errorHandler(ctx, http.StatusInternalServerError, err)
		}
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Request deleted successfully",
	})
}
