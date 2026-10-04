package usecase_test

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"internal-expense-backend/internal/domain"
	"internal-expense-backend/internal/usecase"
)

func setupTestDB(dbName string) *gorm.DB {
	db, err := gorm.Open(sqlite.Open("file:"+dbName+"?mode=memory&cache=shared"), &gorm.Config{})
	if err != nil {
		panic("Gagal membuka in-memory database")
	}

	db.Exec(`CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT, email TEXT, password TEXT, role TEXT, created_at DATETIME, updated_at DATETIME, deleted_at DATETIME)`)
	db.Exec(`CREATE TABLE IF NOT EXISTS expense_requests (id TEXT PRIMARY KEY, user_id TEXT, title TEXT, description TEXT, amount REAL, receipt_url TEXT, status TEXT, notes TEXT, created_at DATETIME, updated_at DATETIME, deleted_at DATETIME)`)

	db.AutoMigrate(&domain.ExpenseRequest{})

	return db
}

func TestCreateExpense_Success(t *testing.T) {
	db := setupTestDB("db_create_success")
	uc := usecase.NewExpenseUseCase(db)

	userID := "staff-1"
	title := "Beli Perlengkapan Kantor"
	description := "Kertas dan tinta printer"
	amount := 150000.0
	receiptURL := "http://minio/bucket/receipt.png"
	isSubmitted := true

	createdExpense, err := uc.Create(userID, title, description, amount, receiptURL, isSubmitted)

	assert.NoError(t, err)
	assert.NotNil(t, createdExpense)
	assert.Equal(t, title, createdExpense.Title)
	assert.Equal(t, amount, createdExpense.Amount)
	assert.Equal(t, domain.StatusSubmitted, createdExpense.Status)
}

func TestUpdateStatus_Success(t *testing.T) {
	db := setupTestDB("db_success")
	uc := usecase.NewExpenseUseCase(db)

	expenseID := "test-exp-123"
	db.Create(&domain.ExpenseRequest{
		ID:     expenseID,
		Status: "SUBMITTED",
		Amount: 50000,
	})

	err := uc.UpdateStatus(expenseID, "MANAGER", "manager-1", "APPROVED", "Sesuai budget")

	assert.NoError(t, err)

	var updatedExpense domain.ExpenseRequest
	db.First(&updatedExpense, "id = ?", expenseID)

	assert.Equal(t, "APPROVED", updatedExpense.Status)
	assert.Equal(t, "Sesuai budget", updatedExpense.Notes)
}

func TestUpdateStatus_Fails_When_Staff_Tries_To_Approve(t *testing.T) {
	db := setupTestDB("db_fail")
	uc := usecase.NewExpenseUseCase(db)

	expenseID := "test-exp-456"
	db.Create(&domain.ExpenseRequest{
		ID:     expenseID,
		Status: "SUBMITTED",
	})

	err := uc.UpdateStatus(expenseID, "STAFF", "staff-1", "APPROVED", "Saya setujui sendiri")

	assert.Error(t, err)
	assert.Contains(t, err.Error(), "permission")
}

func TestUpdateStatus_Fails_When_AlreadyApproved(t *testing.T) {
	db := setupTestDB("db_invalid_state")
	uc := usecase.NewExpenseUseCase(db)

	expenseID := "exp-done-1"
	db.Create(&domain.ExpenseRequest{
		ID:     expenseID,
		Status: "APPROVED",
	})

	err := uc.UpdateStatus(expenseID, "MANAGER", "manager-1", "REJECTED", "Ubah pikiran")

	assert.Error(t, err)
}
