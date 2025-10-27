package handler

import (
	"context"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"Lab1/intermal/app/ds"
	"Lab1/intermal/app/middleware"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// GetChronicleResourcesAPI godoc
// @Summary Получить список хроник
// @Description Получить список всех хроник с возможностью фильтрации по названию, автору и локации
// @Tags chronicle_resources
// @Accept json
// @Produce json
// @Param title query string false "Фильтр по названию"
// @Param author query string false "Фильтр по автору"
// @Param location query string false "Фильтр по локации"
// @Success 200 {object} map[string]interface{} "success"
// @Failure 500 {object} map[string]interface{} "error"
// @Router /api/chronicle_resources [get]
func (h *Handler) GetChronicleResourcesAPI(ctx *gin.Context) {
	title := ctx.Query("title")
	author := ctx.Query("author")
	location := ctx.Query("location")

	resources, err := h.Repository.GetChronicleResources(title, author, location)
	if err != nil {
		h.errorHandler(ctx, http.StatusInternalServerError, err)
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   resources,
	})
}

func (h *Handler) GetChronicleResourceAPI(ctx *gin.Context) {
	idStr := ctx.Param("id_chronicle_resource")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		h.errorHandler(ctx, http.StatusBadRequest, fmt.Errorf("invalid ID format"))
		return
	}

	resource, err := h.Repository.GetChronicleResource(uint(id))
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			h.errorHandler(ctx, http.StatusNotFound, err)
		} else {
			h.errorHandler(ctx, http.StatusInternalServerError, err)
		}
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   resource,
	})
}

// CreateChronicleResourceAPI godoc
// @Summary Создать хронику
// @Description Создание новой хроники (требуется авторизация)
// @Tags chronicle_resources
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param chronicle body ds.ChronicleResource true "Данные хроники"
// @Success 201 {object} map[string]interface{} "success"
// @Failure 400 {object} map[string]interface{} "error"
// @Failure 401 {object} map[string]interface{} "error"
// @Router /api/chronicle_resources [post]
func (h *Handler) CreateChronicleResourceAPI(ctx *gin.Context) {
	var resource ds.ChronicleResource
	if err := ctx.ShouldBindJSON(&resource); err != nil {
		h.errorHandler(ctx, http.StatusBadRequest, fmt.Errorf("invalid JSON: %v", err))
		return
	}

	resource.ID = 0

	createdResource, err := h.Repository.CreateChronicleResource(resource)
	if err != nil {
		h.errorHandler(ctx, http.StatusInternalServerError, err)
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{
		"status": "success",
		"data":   createdResource,
	})
}

func (h *Handler) UpdateChronicleResourceAPI(ctx *gin.Context) {
	idStr := ctx.Param("id_chronicle_resource")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		h.errorHandler(ctx, http.StatusBadRequest, fmt.Errorf("invalid ID format"))
		return
	}

	var resource ds.ChronicleResource
	if err := ctx.ShouldBindJSON(&resource); err != nil {
		h.errorHandler(ctx, http.StatusBadRequest, fmt.Errorf("invalid JSON: %v", err))
		return
	}

	err = h.Repository.UpdateChronicleResource(uint(id), resource)
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
		"message": "Chronicle resource updated successfully",
	})
}

func (h *Handler) DeleteChronicleResourceAPI(ctx *gin.Context) {
	idStr := ctx.Param("id_chronicle_resource")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		h.errorHandler(ctx, http.StatusBadRequest, fmt.Errorf("invalid ID format"))
		return
	}

	err = h.Repository.DeleteChronicleResource(uint(id))
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
		"message": "Chronicle resource deleted successfully",
	})
}

func (h *Handler) UploadChronicleResourceImageAPI(ctx *gin.Context) {
	idStr := ctx.Param("id_chronicle_resource")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		h.errorHandler(ctx, http.StatusBadRequest, fmt.Errorf("invalid ID format"))
		return
	}

	_, err = h.Repository.GetChronicleResource(uint(id))
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			h.errorHandler(ctx, http.StatusNotFound, err)
		} else {
			h.errorHandler(ctx, http.StatusInternalServerError, err)
		}
		return
	}

	file, err := ctx.FormFile("image")
	if err != nil {
		h.errorHandler(ctx, http.StatusBadRequest, fmt.Errorf("no image file provided"))
		return
	}

	src, err := file.Open()
	if err != nil {
		h.errorHandler(ctx, http.StatusInternalServerError, err)
		return
	}
	defer src.Close()

	fileName := h.Repository.GenerateImageFileName(file.Filename)

	err = h.Repository.UploadFileToMinIO(
		context.Background(),
		fileName,
		src,
		file.Size,
		file.Header.Get("Content-Type"),
	)
	if err != nil {
		h.errorHandler(ctx, http.StatusInternalServerError, err)
		return
	}

	imagePath := "http://127.0.0.1:9000/chronicles/" + fileName
	err = h.Repository.UpdateChronicleResourceImage(uint(id), imagePath)
	if err != nil {
		h.errorHandler(ctx, http.StatusInternalServerError, err)
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"status":     "success",
		"message":    "Image uploaded successfully",
		"image_path": imagePath,
	})
}

func (h *Handler) AddChronicleToRequestAPI(ctx *gin.Context) {
	idStr := ctx.Param("id_chronicle_resource")
	chronicleID, err := strconv.ParseUint(idStr, 10, 32)
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

	_, err = h.Repository.GetChronicleResource(uint(chronicleID))
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			h.errorHandler(ctx, http.StatusNotFound, err)
		} else {
			h.errorHandler(ctx, http.StatusInternalServerError, err)
		}
		return
	}

	draftRequest, _, err := h.Repository.GetDraftRequestChronicleResearchInfo(userUUID)
	if err != nil {
		draftRequest, err = h.Repository.CreateRequestChronicleResearchWithChronicle(userUUID, uint(chronicleID))
		if err != nil {
			h.errorHandler(ctx, http.StatusInternalServerError, fmt.Errorf("failed to create draft request: %v", err))
			return
		}
	} else {
		err = h.Repository.AddChronicleToRequest(draftRequest.ID, uint(chronicleID), "")
		if err != nil {
			h.errorHandler(ctx, http.StatusInternalServerError, fmt.Errorf("failed to add chronicle to request: %v", err))
			return
		}
	}

	ctx.JSON(http.StatusOK, gin.H{
		"status":     "success",
		"message":    "Chronicle added to draft request successfully",
		"request_id": draftRequest.ID,
	})
}
