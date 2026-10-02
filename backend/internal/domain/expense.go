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
	ID        string         `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name      string         `gorm:"not null" json:"name"`
	Email     string         `gorm:"unique;not null" json:"email"`
	Password  string         `gorm:"not null" json:"-"`
	Role      string         `gorm:"type:varchar(50);not null;default:'STAFF'" json:"role"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type ExpenseRequest struct {
	ID          string         `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID      string         `gorm:"type:uuid;not null" json:"user_id"`
	User        User           `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Title       string         `gorm:"not null" json:"title" binding:"required,min=3,max=100"`
	Description string         `gorm:"type:text" json:"description" binding:"max=500"`
	Amount      float64        `gorm:"not null" json:"amount" binding:"required,gt=0"`
	ReceiptURL  string         `gorm:"type:text" json:"receipt_url"`
	Status      string         `gorm:"type:varchar(50);not null;default:'DRAFT'" json:"status" binding:"oneof=DRAFT SUBMITTED APPROVED REJECTED PAID"`
	Notes       string         `gorm:"type:text" json:"notes" binding:"max=255"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}
