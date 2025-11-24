package handler

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

// Chronicle Research (м-м связь) API

// UpdateChronicleResearchInRequestAPI godoc
// @Summary Обновить хронику в заявке
// @Description Обновление количества, порядка или других полей связи хроники с заявкой (требуется авторизация)
// @Tags chronicle_research
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "ID заявки"
// @Param chronicle_id path int true "ID хроники"
// @Param updates body object true "Обновляемые поля (quantity, order, etc.)"
// @Success 200 {object} map[string]interface{} "success"
// @Failure 400 {object} map[string]interface{} "error"
// @Failure 401 {object} map[string]interface{} "error"
// @Router /api/chronicle_research/{id}/chronicles/{chronicle_id} [put]
func (h *Handler) UpdateChronicleResearchInRequestAPI(ctx *gin.Context) {
	requestIDStr := ctx.Param("id")
	chronicleIDStr := ctx.Param("chronicle_id")

	requestID, err := strconv.ParseUint(requestIDStr, 10, 32)
	if err != nil {
		h.errorHandler(ctx, http.StatusBadRequest, fmt.Errorf("invalid request ID format"))
		return
	}
	chronicleID, err := strconv.ParseUint(chronicleIDStr, 10, 32)
	if err != nil {
		h.errorHandler(ctx, http.StatusBadRequest, fmt.Errorf("invalid chronicle ID format"))
		return
	}

	var updates map[string]interface{}
	if err := ctx.ShouldBindJSON(&updates); err != nil {
		h.errorHandler(ctx, http.StatusBadRequest, fmt.Errorf("invalid JSON: %v", err))
		return
	}

	err = h.Repository.UpdateChronicleResearchInRequest(uint(requestID), uint(chronicleID), updates)
	if err != nil {
		if strings.Contains(err.Error(), "not found") || strings.Contains(err.Error(), "no valid fields") {
			h.errorHandler(ctx, http.StatusBadRequest, err)
		} else {
			h.errorHandler(ctx, http.StatusInternalServerError, err)
		}
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Chronicle research updated successfully",
	})
}

// DeleteChronicleResearchFromRequestAPI godoc
// @Summary Удалить хронику из заявки
// @Description Удаление хроники из заявки (требуется авторизация)
// @Tags chronicle_research
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "ID заявки"
// @Param chronicle_id path int true "ID хроники"
// @Success 200 {object} map[string]interface{} "success"
// @Failure 400 {object} map[string]interface{} "error"
// @Failure 401 {object} map[string]interface{} "error"
// @Failure 404 {object} map[string]interface{} "error"
// @Router /api/chronicle_research/{id}/chronicles/{chronicle_id} [delete]
func (h *Handler) DeleteChronicleResearchFromRequestAPI(ctx *gin.Context) {
	requestIDStr := ctx.Param("id")
	chronicleIDStr := ctx.Param("chronicle_id")

	requestID, err := strconv.ParseUint(requestIDStr, 10, 32)
	if err != nil {
		h.errorHandler(ctx, http.StatusBadRequest, fmt.Errorf("invalid request ID format"))
		return
	}
	chronicleID, err := strconv.ParseUint(chronicleIDStr, 10, 32)
	if err != nil {
		h.errorHandler(ctx, http.StatusBadRequest, fmt.Errorf("invalid chronicle ID format"))
		return
	}

	err = h.Repository.DeleteChronicleResearchFromRequest(uint(requestID), uint(chronicleID))
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
		"message": "Chronicle removed from request successfully",
	})
}
