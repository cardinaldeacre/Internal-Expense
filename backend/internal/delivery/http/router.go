package http

import (
	"internal-expense-backend/internal/delivery/middleware"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRouter(r *gin.Engine, authHandler *AuthHandler, expenseHandler *ExpenseHandler) {
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-CSRF-Token"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	api := r.Group("/api/v1")

	// Public Routes
	api.POST("/auth/login", authHandler.Login)

	protectedCSRF := api.Group("")
	protectedCSRF.Use(middleware.AuthMiddleware())
	protectedCSRF.Use(middleware.CSRFMiddleware())

	protectedCSRF.POST("/expenses", expenseHandler.CreateExpense)
	protectedCSRF.PATCH("/expenses/:id/status", expenseHandler.UpdateStatus)

	protectedAuth := api.Group("")
	protectedAuth.Use(middleware.AuthMiddleware())

	protectedAuth.POST("/auth/logout", authHandler.Logout)
	protectedAuth.GET("/auth/me", authHandler.Me)
	protectedAuth.GET("/expenses", expenseHandler.GetExpenses)
}
