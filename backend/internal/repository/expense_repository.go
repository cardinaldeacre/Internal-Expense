package repository

import (
	"internal-expense-backend/internal/domain"

	"gorm.io/gorm"
)

type ExpenseRepository struct {
	db *gorm.DB
}

func NewExpenseRepository(db *gorm.DB) *ExpenseRepository {
	return &ExpenseRepository{db: db}
}

func (r *ExpenseRepository) FindAll(page, limit int, search, status, userID, role string) ([]domain.ExpenseRequest, int64, error) {
	var expenses []domain.ExpenseRequest
	var total int64

	query := r.db.Model(&domain.ExpenseRequest{}).Preload("User")

	if role == domain.RoleStaff {
		query = query.Where("user_id = ?", userID)
	}

	if status != "" {
		query = query.Where("status = ?", status)
	}

	if search != "" {
		searchKeyword := "%" + search + "%"
		query = query.Where("title ILIKE ? OR description ILIKE ?", searchKeyword, searchKeyword)
	}

	query.Count(&total)

	offset := (page - 1) * limit
	err := query.Order("created_at DESC").Offset(offset).Limit(limit).Find(&expenses).Error
	if err != nil {
		return nil, 0, err
	}

	return expenses, total, nil
}

func (r *ExpenseRepository) FindByID(id string) (*domain.ExpenseRequest, error) {
	var expense domain.ExpenseRequest
	err := r.db.Preload("User").First(&expense, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &expense, nil
}

func (r *ExpenseRepository) Save(expense *domain.ExpenseRequest) error {
	return r.db.Create(expense).Error
}

func (r *ExpenseRepository) Delete(id string) error {
	return r.db.Delete(&domain.ExpenseRequest{}, "id = ?", id).Error
}
