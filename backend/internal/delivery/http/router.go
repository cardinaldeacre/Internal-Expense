package http

import (
	"internal-expense-backend/internal/delivery/middleware"
	"os"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"

	_ "internal-expense-backend/docs"
)

func SetupRouter(r *gin.Engine, authHandler *AuthHandler, expenseHandler *ExpenseHandler) {
	originsEnv := os.Getenv("ALLOWED_ORIGINS")

	if originsEnv != "" {
		originsEnv = "http://localhost:5173,http://localhost:3000"
	}

	allowedOrigins := strings.Split(originsEnv, ",")

	r.Use(cors.New(cors.Config{
		AllowOrigins:     allowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-CSRF-Token"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	r.Static("/uploads", "./uploads")
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
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
	protectedAuth.GET("/expenses/:id/receipt", expenseHandler.GetReceiptImage)
}
