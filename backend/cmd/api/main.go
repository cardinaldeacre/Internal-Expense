package main

import (
	"log"
	"os"

	"internal-expense-backend/internal/usecase"
	"internal-expense-backend/pkg/database"
	"internal-expense-backend/pkg/utils"
	"internal-expense-backend/worker"

	httpDelivery "internal-expense-backend/internal/delivery/http"
	"internal-expense-backend/internal/delivery/middleware"

	"github.com/gin-gonic/gin"
	"github.com/hibiken/asynq"
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

	redisAddr := os.Getenv("REDIS_ADDR")
	if redisAddr == "" {
		log.Fatal("REDIS_ADDR environment variable is not set")
		return
	}

	redisOpt := asynq.RedisClientOpt{Addr: redisAddr}
	asynqClient := asynq.NewClient(redisOpt)
	defer asynqClient.Close()

	srv := asynq.NewServer(redisOpt, asynq.Config{
		Concurrency: 10,
	})

	authUsecase := usecase.NewAuthUseCase(db)
	expenseUsecase := usecase.NewExpenseUseCase(db)
	authHandler := httpDelivery.NewAuthHandler(authUsecase)
	expenseHandler := httpDelivery.NewExpenseHandler(expenseUsecase, asynqClient)

	httpDelivery.SetupRouter(r, authHandler, expenseHandler)
	mux := asynq.NewServeMux()
	mux.HandleFunc(worker.TypeEmailNotification, worker.HandleEmailNotificationTask)

	go func() {
		if err := srv.Run(mux); err != nil {
			log.Fatalf("Gagal menjalankan Asynq worker: %v", err)
		}
	}()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server is running on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
