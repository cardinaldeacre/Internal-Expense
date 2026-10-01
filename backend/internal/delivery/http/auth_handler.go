package http

import (
	"internal-expense-backend/internal/usecase"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	authUsecase *usecase.AuthUseCase
}

func NewAuthHandler(r *gin.Engine, authUsecase *usecase.AuthUseCase) {
	handler := &AuthHandler{
		authUsecase: authUsecase,
	}

	api := r.Group("/api/v1")
	{
		api.POST("/auth/login", handler.Login)
		api.POST("/auth/logout", handler.Logout)
	}
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request body: " + err.Error()})
		return
	}

	token, user, err := h.authUsecase.Login(req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Invalid email or password, " + err.Error()})
		return
	}

	isSecure := os.Getenv("COOKIE_SECURE") == "true"

	c.SetCookie("token", token, 86400, "/", "", isSecure, true)
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Login successful",
		"data": gin.H{
			"id": user.ID,
			"name": user.Name,
			"email": user.Email,
			"role": user.Role,
		},
	})
}

func (h *AuthHandler) Logout(c *gin.Context) {
	isSecure := os.Getenv("COOKIE_SECURE") == "true"

	c.SetCookie("token", "", -1, "/", "", isSecure, true)
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Logout successful",
	})
}
