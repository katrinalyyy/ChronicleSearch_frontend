package auth

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var (
	// Секретные ключи (в продакшене хранить в переменных окружения!)
	AccessTokenSecret  = []byte("chronicle-access-secret-key-change-me")
	RefreshTokenSecret = []byte("chronicle-refresh-secret-key-change-me")

	AccessTokenDuration  = 15 * time.Minute // Access token живет 15 минут
	RefreshTokenDuration = 7 * 24 * time.Hour // Refresh token живет 7 дней
)

// Claims структура для JWT токена
type Claims struct {
	UserID      uint   `json:"user_id"`
	Email       string `json:"email"`
	IsModerator bool   `json:"is_moderator"`
	jwt.RegisteredClaims
}

// TokenPair пара токенов (access + refresh)
type TokenPair struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

// GenerateTokenPair генерирует пару токенов для пользователя
func GenerateTokenPair(userID uint, email string, isModerator bool) (*TokenPair, error) {
	// Создаем access token
	accessClaims := &Claims{
		UserID:      userID,
		Email:       email,
		IsModerator: isModerator,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(AccessTokenDuration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "chronicle-search",
		},
	}

	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	accessTokenString, err := accessToken.SignedString(AccessTokenSecret)
	if err != nil {
		return nil, err
	}

	// Создаем refresh token
	refreshClaims := &Claims{
		UserID:      userID,
		Email:       email,
		IsModerator: isModerator,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(RefreshTokenDuration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "chronicle-search",
		},
	}

	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	refreshTokenString, err := refreshToken.SignedString(RefreshTokenSecret)
	if err != nil {
		return nil, err
	}

	return &TokenPair{
		AccessToken:  accessTokenString,
		RefreshToken: refreshTokenString,
	}, nil
}

// ValidateAccessToken проверяет access token и возвращает claims
func ValidateAccessToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return AccessTokenSecret, nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}

// ValidateRefreshToken проверяет refresh token и возвращает claims
func ValidateRefreshToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return RefreshTokenSecret, nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}

