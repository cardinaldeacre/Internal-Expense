package main

import (
	"log"
	"os"

	"internal-expense-backend/internal/usecase"
	"internal-expense-backend/pkg/database"
	"internal-expense-backend/pkg/utils"

	httpDelivery "internal-expense-backend/internal/delivery/http"
	"internal-expense-backend/internal/delivery/middleware"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, relying on system environment variables")
	}

	db := database.ConnectDB()

	database.RunMigration(db)
	database.SeedData(db)
	utils.InitMinIOBucket()

	r := gin.New()

	r.Use(middleware.ErrorHandlingMiddleware())
	r.Use(gin.Logger())
	r.SetTrustedProxies(nil)

	authUsecase := usecase.NewAuthUseCase(db)
	expenseUsecase := usecase.NewExpenseUseCase(db)
	authHandler := httpDelivery.NewAuthHandler(authUsecase)
	expenseHandler := httpDelivery.NewExpenseHandler(expenseUsecase)

	httpDelivery.SetupRouter(r, authHandler, expenseHandler)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server is running on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
