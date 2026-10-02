package usecase

import (
	"errors"
	"internal-expense-backend/internal/domain"
	"internal-expense-backend/internal/repository"

	"gorm.io/gorm"
)

type ExpenseUseCase struct {
	db *gorm.DB
}

func NewExpenseUseCase(db *gorm.DB) *ExpenseUseCase {
	return &ExpenseUseCase{db: db}
}

func (u *ExpenseUseCase) Create(userID string, title, description string, amount float64, receiptURL string, isSubmitted bool) (*domain.ExpenseRequest, error) {
	status := domain.StatusDraft
	if isSubmitted {
		status = domain.StatusSubmitted
	}

	expense := &domain.ExpenseRequest{
		UserID:      userID,
		Title:       title,
		Description: description,
		Amount:      amount,
		Status:      status,
		ReceiptURL:  receiptURL,
	}

	if err := u.db.Create(expense).Error; err != nil {
		return nil, err
	}

	return expense, nil
}

func (u *ExpenseUseCase) UpdateStatus(expenseID, role, actionUserID string, newStatus string, notes string) error {
	var expense domain.ExpenseRequest
	if err := u.db.First(&expense, "id = ?", expenseID).Error; err != nil {
		return errors.New("expense request not found")
	}

	switch role {
	case domain.RoleManager:
		if newStatus != domain.StatusApproved && newStatus != domain.StatusRejected {
			return errors.New("manager can only approve or reject requests")
		}
	case domain.RoleFinance:
		if newStatus != domain.StatusPaid {
			return errors.New("finance can only mark requests as paid")
		}
	case domain.RoleStaff:
		return errors.New("staff does not have permission to change request status")
	}

	expense.Status = newStatus
	expense.Notes = notes
	return u.db.Save(&expense).Error
}

func (u *ExpenseUseCase) GetExpenses(page, limit int, search, status, userID, role string) ([]domain.ExpenseRequest, int64, error) {
	expenseRepo := repository.NewExpenseRepository(u.db)
	return expenseRepo.FindAll(page, limit, search, status, userID, role)
}
