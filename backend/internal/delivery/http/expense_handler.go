package http

import (
	"net/http"

	"internal-expense-backend/internal/delivery/middleware"
	"internal-expense-backend/internal/domain"
	"internal-expense-backend/internal/usecase"
	"internal-expense-backend/pkg/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ExpenseHandler struct {
	expenseUsecase *usecase.ExpenseUseCase
	db             *gorm.DB
}

func NewExpenseHandler(r *gin.Engine, expenseUsecase *usecase.ExpenseUseCase, db *gorm.DB) {
	handler := &ExpenseHandler{expenseUsecase: expenseUsecase, db: db}

	api := r.Group("/api/v1", middleware.AuthMiddleware())
	{
		api.POST("/expenses", handler.CreateExpense)
		api.GET("/expenses", handler.GetExpenses)
		api.PATCH("/expenses/:id/status", middleware.RBACMiddleware(domain.RoleManager, domain.RoleFinance), handler.UpdateStatus)
	}
}

type GetExpenseQuery struct {
	Page   int    `form:"page,default=1" binding:"min=1"`
	Limit  int    `form:"limit,default=10" binding:"min=1,max=100"`
	Search string `form:"search" binding:"omitempty,max=100"`
	Status string `form:"status" binding:"omitempty,oneof=DRAFT SUBMITTED APPROVED REJECTED PAID"`
	Sort   string `form:"sort,default=created_at_desc" binding:"omitempty,oneof=created_at_desc created_at_asc amount_desc amount_asc"`
}

type CreateExpenseReq struct {
	Title       string  `form:"title" binding:"required,min=3,max=100"`
	Description string  `form:"description" binding:"omitempty,max=500"`
	Amount      float64 `form:"amount" binding:"required,gt=0"`
	IsSubmitted bool    `form:"is_submitted"`
}

func (h *ExpenseHandler) CreateExpense(c *gin.Context) {
	var req CreateExpenseReq
	if err := c.ShouldBind(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request body: " + err.Error()})
		return
	}

	userID := c.GetString("user_id")

	var receiptURL string
	file, err := c.FormFile("receipt")
	if err == nil {
		if file.Size > 2*1024*1024 {
			c.JSON(http.StatusUnprocessableEntity, gin.H{"success": false, "message": "Receipt file size exceeds 2MB limit"})
			return
		}

		contentType := file.Header.Get("Content-Type")
		if contentType != "image/jpeg" && contentType != "image/png" && contentType != "application/pdf" {
			c.JSON(http.StatusUnprocessableEntity, gin.H{"success": false, "message": "Invalid receipt file type. Only JPEG, PNG, and PDF are allowed"})
			return
		}

		receiptURL, err = utils.UploadToMinIO(file)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to upload receipt to cloud storage: " + err.Error()})
			return
		}
	} else if req.IsSubmitted {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Receipt is required when submitting an expense"})
		return
	}

	expense, err := h.expenseUsecase.Create(userID, req.Title, req.Description, req.Amount, receiptURL, req.IsSubmitted)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to create expense: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Expense request created successfully",
		"data":    expense,
	})
}

type UpdateExpenseStatusReq struct {
	Status string `json:"status" binding:"required,oneof=APPROVED REJECTED PAID"`
	Notes  string `json:"notes" binding:"omitempty,max=255"`
}

func (h *ExpenseHandler) UpdateStatus(c *gin.Context) {
	expenseID := c.Param("id")
	role := c.GetString("role")
	userID := c.GetString("user_id")

	var req UpdateExpenseStatusReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request body: " + err.Error()})
		return
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request body: " + err.Error()})
		return
	}

	err := h.expenseUsecase.UpdateStatus(expenseID, role, userID, req.Status, req.Notes)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Expense status updated successfully",
	})
}

func (h *ExpenseHandler) GetExpenses(c *gin.Context) {
	var query GetExpenseQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid query parameters: " + err.Error()})
		return
	}

	userID := c.GetString("user_id")
	role := c.GetString("role")

	expenses, total, err := h.expenseUsecase.GetExpenses(query.Page, query.Limit, query.Search, query.Status, userID, role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Expenses retrieved successfully",
		"data": gin.H{
			"items": expenses,
			"meta": gin.H{
				"page":  query.Page,
				"limit": query.Limit,
				"total": total,
			},
		},
	})
}
