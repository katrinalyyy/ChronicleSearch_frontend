package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type pingResp struct {
	Message string `json:"message"`
}

func (h *Handler) Ping(gCtx *gin.Context) {
	gCtx.JSON(http.StatusOK, pingResp{
		Message: "pong",
	})
}

