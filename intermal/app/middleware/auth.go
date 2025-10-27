package middleware

import (
	"Lab1/intermal/app/auth"
	"Lab1/intermal/app/role"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

const (
	UserIDKey      = "user_id"
	UserEmailKey   = "user_email"
	IsModeratorKey = "is_moderator"
)

// AuthMiddleware проверяет наличие и валидность JWT токена
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Получаем токен из заголовка Authorization
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"status":      "error",
				"description": "Authorization header is required",
			})
			c.Abort()
			return
		}

		// Проверяем формат Bearer {token}
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"status":      "error",
				"description": "Invalid authorization header format. Use: Bearer {token}",
			})
			c.Abort()
			return
		}

		tokenString := parts[1]

		// Валидируем токен
		claims, err := auth.ValidateAccessToken(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"status":      "error",
				"description": "Invalid or expired token",
			})
			c.Abort()
			return
		}

		// Сохраняем данные пользователя в контекст
		c.Set(UserIDKey, claims.UserID)
		c.Set(UserEmailKey, claims.Email)
		c.Set(IsModeratorKey, claims.IsModerator)

		c.Next()
	}
}

// ModeratorMiddleware проверяет, что пользователь является модератором
// Должен использоваться после AuthMiddleware
func ModeratorMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		isModerator, exists := c.Get(IsModeratorKey)
		if !exists {
			c.JSON(http.StatusForbidden, gin.H{
				"status":      "error",
				"description": "User authentication required",
			})
			c.Abort()
			return
		}

		if !isModerator.(bool) {
			c.JSON(http.StatusForbidden, gin.H{
				"status":      "error",
				"description": "Moderator access required",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

// OptionalAuthMiddleware пытается извлечь данные из токена, но не требует его наличия
func OptionalAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.Next()
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) == 2 && parts[0] == "Bearer" {
			tokenString := parts[1]
			claims, err := auth.ValidateAccessToken(tokenString)
			if err == nil {
				c.Set(UserIDKey, claims.UserID)
				c.Set(UserEmailKey, claims.Email)
				c.Set(IsModeratorKey, claims.IsModerator)
			}
		}

		c.Next()
	}
}

// GetUserID извлекает ID пользователя из контекста
func GetUserID(c *gin.Context) (uint, bool) {
	userID, exists := c.Get(UserIDKey)
	if !exists {
		return 0, false
	}
	return userID.(uint), true
}

// GetUserEmail извлекает email пользователя из контекста
func GetUserEmail(c *gin.Context) (string, bool) {
	email, exists := c.Get(UserEmailKey)
	if !exists {
		return "", false
	}
	return email.(string), true
}

// IsModerator проверяет, является ли пользователь модератором
func IsModerator(c *gin.Context) bool {
	isModerator, exists := c.Get(IsModeratorKey)
	if !exists {
		return false
	}
	return isModerator.(bool)
}

// GetUserUUID извлекает UUID пользователя из контекста (для JWT) и возвращает как строку
func GetUserUUID(c *gin.Context) (string, bool) {
	userUUID, exists := c.Get("user_uuid")
	if !exists {
		return "", false
	}
	// Преобразуем uuid.UUID в string
	return userUUID.(uuid.UUID).String(), true
}

// GetUserRole извлекает роль пользователя из контекста (для JWT)
func GetUserRole(c *gin.Context) (int, bool) {
	userRole, exists := c.Get("user_role")
	if !exists {
		return 0, false
	}
	// Преобразуем role.Role (который int по сути) в int
	return int(userRole.(role.Role)), true
}
