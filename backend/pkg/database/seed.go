package database

import (
	"internal-expense-backend/internal/domain"
	"log"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func SeedData(db *gorm.DB) {
	var count int64
	db.Model(&domain.User{}).Count(&count)
	if count > 0 {
		log.Println("Database already seeded, skipping...")
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("Failed to hash password for seeder: %v", err)
	}

	log.Println("Seeding database...")
	users := []domain.User{
		{
			Name:     "Super Admin",
			Email:    "admin@example.com",
			Password: string(hashedPassword),
			Role:     domain.RoleAdmin,
		},
		{
			Name:     "Staff Maulana",
			Email:    "staff@example.com",
			Password: string(hashedPassword),
			Role:     domain.RoleStaff,
		},
		{
			Name:     "Manager Rizky",
			Email:    "manager@example.com",
			Password: string(hashedPassword),
			Role:     domain.RoleManager,
		},
		{
			Name:     "Finance Dewi",
			Email:    "finance@example.com",
			Password: string(hashedPassword),
			Role:     domain.RoleFinance,
		},
	}

	for _, user := range users {
		if err := db.Create(&user).Error; err != nil {
			log.Printf("Failed to seed user %s: %v", user.Email, err)
		} else {
			log.Printf("Seeded user: %s (%s)", user.Email, user.Role)
		}
	}
}
