package http

import (
	"internal-expense-backend/internal/delivery/middleware"

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
	}))

	api := r.Group("/api/v1")

	// Public Routes
	api.POST("/auth/login", authHandler.Login)

	// Protected Routes
	protected := api.Group("")
	protected.Use(middleware.AuthMiddleware())
	protected.Use(middleware.CSRFMiddleware())
	// Auth
	protected.POST("/auth/logout", authHandler.Logout)
	protected.GET("/auth/me", authHandler.Me)

	// Expenses
	protected.GET("/expenses", expenseHandler.GetExpenses)
	protected.POST("/expenses", expenseHandler.CreateExpense)
	protected.PATCH("/expenses/:id/status", expenseHandler.UpdateStatus)
}
