package database

import (
	"internal-expense-backend/internal/domain"
	"log"

	"gorm.io/gorm"
)

func RunMigration(db *gorm.DB) {
	log.Println("Running database migration...")

	err := db.AutoMigrate(
		&domain.User{},
		&domain.ExpenseRequest{},
	)

	if err != nil {
		log.Fatalf("Failed to run database migration: %v", err)
	}

	log.Println("Database migration completed successfully.")
}
