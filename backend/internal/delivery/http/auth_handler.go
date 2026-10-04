package http

import (
	"crypto/rand"
	"encoding/hex"
	"internal-expense-backend/internal/usecase"
	"internal-expense-backend/pkg/response"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type AuthHandler struct {
	authUsecase *usecase.AuthUseCase
}

func NewAuthHandler(authUsecase *usecase.AuthUseCase) *AuthHandler {
	return &AuthHandler{authUsecase: authUsecase}
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func generateCSRFToken() string {
	bytes := make([]byte, 32)
	rand.Read(bytes)
	return hex.EncodeToString(bytes)
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.Error(response.NewAppError(
			response.ErrValidation,
			"Invalid request body: "+err.Error(),
			err,
		))
		return
	}

	token, user, err := h.authUsecase.Login(req.Email, req.Password)
	if err != nil {
		c.Error(response.NewAppError(
			response.ErrAuth,
			"Invalid email or password, "+err.Error(),
			err,
		))
		return
	}

	isSecure := os.Getenv("COOKIE_SECURE") == "true"

	c.SetSameSite(http.SameSiteStrictMode)
	c.SetCookie("token", token, 86400, "/", "", isSecure, true)

	csrfToken := generateCSRFToken()
	c.SetCookie("csrf_token", csrfToken, 86400, "/", "", isSecure, false)
	response.Success(c, http.StatusOK, "Login successful", gin.H{
		"user": gin.H{
			"id":    user.ID,
			"name":  user.Name,
			"email": user.Email,
			"role":  user.Role,
		},
		"csrf_token": csrfToken,
	},
	)
}

func (h *AuthHandler) Logout(c *gin.Context) {
	isSecure := os.Getenv("COOKIE_SECURE") == "true"

	c.SetCookie("token", "", -1, "/", "", isSecure, true)
	response.Success(c, http.StatusOK, "Logout successful", nil)
}

func (h *AuthHandler) Me(c *gin.Context) {
	userID := c.GetString("user_id")
	email := c.GetString("email")
	role := c.GetString("role")

	if userID == "" {
		c.Error(response.NewAppError(
			response.ErrAuth,
			"invalid token or user not found",
			nil,
		))
		return
	}

	response.Success(c, http.StatusOK, "User info retrieved successfully", gin.H{
		"id":    userID,
		"email": email,
		"role":  role,
	},
	)
}

func AuthMiddlewareCookieOnlyTest(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString, err := c.Cookie("token")
		if err != nil {
			c.Error(response.NewAppError(
				response.ErrAuth,
				"Unauthorized: No token provided",
				nil,
			))
			c.Abort()
			return
		}

		user, err := usecase.ValidateToken(db, tokenString)
		if err != nil {
			c.Error(response.NewAppError(
				response.ErrAuth,
				"Unauthorized: Invalid or expired token",
				err,
			))
			c.Abort()
			return
		}

		response.Success(c, http.StatusOK, "Token is valid", gin.H{
			"id":    user.ID,
			"name":  user.Name,
			"email": user.Email,
			"role":  user.Role,
		},
		)
	}
}
