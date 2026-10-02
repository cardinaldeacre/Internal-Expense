package main

import (
	"log"
	"os"

	"internal-expense-backend/internal/usecase"
	"internal-expense-backend/pkg/database"

	httpDelivery "internal-expense-backend/internal/delivery/http"

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

	r := gin.Default()

	r.SetTrustedProxies(nil)

	authUsecase := usecase.NewAuthUseCase(db)
	httpDelivery.NewAuthHandler(r, authUsecase)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server is running on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
