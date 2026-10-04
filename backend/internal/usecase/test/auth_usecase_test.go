package usecase_test

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"internal-expense-backend/internal/domain"
	"internal-expense-backend/internal/usecase"
)

func setupAuthTestDB() *gorm.DB {
	db, err := gorm.Open(sqlite.Open("file:auth_db?mode=memory&cache=shared"), &gorm.Config{})
	if err != nil {
		panic("Gagal membuka in-memory database")
	}

	db.Exec(`CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT, email TEXT, password TEXT, role TEXT, created_at DATETIME, updated_at DATETIME, deleted_at DATETIME)`)
	db.AutoMigrate(&domain.User{})

	return db
}

func TestLogin_Success(t *testing.T) {
	db := setupAuthTestDB()
	authUC := usecase.NewAuthUseCase(db)

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)

	db.Create(&domain.User{
		ID:       "user-1",
		Name:     "Iqbal Maulana",
		Email:    "iqbal@example.com",
		Password: string(hashedPassword),
		Role:     "STAFF",
	})

	token, user, err := authUC.Login("iqbal@example.com", "password123")

	assert.NoError(t, err)
	assert.NotEmpty(t, token)
	assert.NotNil(t, user)
	assert.Equal(t, "iqbal@example.com", user.Email)
}

func TestLogin_Fails_WrongPassword(t *testing.T) {
	db := setupAuthTestDB()
	authUC := usecase.NewAuthUseCase(db)

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	db.Create(&domain.User{
		ID:       "user-2",
		Name:     "Test User",
		Email:    "test@example.com",
		Password: string(hashedPassword),
		Role:     "STAFF",
	})

	token, user, err := authUC.Login("test@example.com", "salahpassword")

	assert.Error(t, err)
	assert.Empty(t, token)
	assert.Nil(t, user)
}
