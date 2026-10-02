package http

import (
	"internal-expense-backend/internal/delivery/middleware"
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

func NewAuthHandler(r *gin.Engine, authUsecase *usecase.AuthUseCase) {
	handler := &AuthHandler{
		authUsecase: authUsecase,
	}

	api := r.Group("/api/v1/auth")
	{
		api.POST("/login", handler.Login)
		api.POST("/logout", handler.Logout)
		api.GET("/me", middleware.AuthMiddleware(), handler.Me)
	}
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body: "+err.Error())
		return
	}

	token, user, err := h.authUsecase.Login(req.Email, req.Password)
	if err != nil {
		response.Error(c, http.StatusUnauthorized, "Invalid email or password, "+err.Error())
		return
	}

	isSecure := os.Getenv("COOKIE_SECURE") == "true"

	c.SetCookie("token", token, 86400, "/", "", isSecure, true)
	response.Success(c, http.StatusOK, "Login successful", gin.H{
		"id":    user.ID,
		"name":  user.Name,
		"email": user.Email,
		"role":  user.Role,
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
		response.Error(c, http.StatusUnauthorized, "invalid token or user not found")
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
			response.Error(c, http.StatusUnauthorized, "Unauthorized: No token provided")
			c.Abort()
			return
		}

		user, err := usecase.ValidateToken(db, tokenString)
		if err != nil {
			response.Error(c, http.StatusUnauthorized, "Unauthorized: Invalid or expired token")
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
