package http

import (
	"internal-expense-backend/internal/delivery/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRouter(r *gin.Engine, authHandler *AuthHandler, expenseHandler *ExpenseHandler) {
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
