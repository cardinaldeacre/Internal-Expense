package domain

import (
	"time"

	"gorm.io/gorm"
)

const (
	RoleAdmin   = "ADMIN"
	RoleStaff   = "STAFF"
	RoleManager = "MANAGER"
	RoleFinance = "FINANCE"
)

const (
	StatusDraft     = "DRAFT"
	StatusSubmitted = "SUBMITTED"
	StatusApproved  = "APPROVED"
	StatusRejected  = "REJECTED"
	StatusPaid      = "PAID"
)

type User struct {
	ID        string `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	Name      string `gorm:"not null"`
	Email     string `gorm:"unique;not null"`
	Password  string `gorm:"not null"`
	Role      string `gorm:"type:varchar(50);not null;default:'STAFF'"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`
}

type ExpenseRequest struct {
	ID          string  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	UserID      string  `gorm:"type:uuid;not null"`
	User        User    `gorm:"foreignKey:UserID"`
	Title       string  `gorm:"not null"`
	Description string  `gorm:"type:text"`
	Amount      float64 `gorm:"not null"`
	ReceiptURL  string  `gorm:"type:text"`
	Status      string  `gorm:"type:varchar(50);not null;default:'DRAFT'"`
	Notes       string  `gorm:"type:text"`
	CreatedAt   time.Time
	UpdatedAt   time.Time
	DeletedAt   gorm.DeletedAt `gorm:"index"`
}
