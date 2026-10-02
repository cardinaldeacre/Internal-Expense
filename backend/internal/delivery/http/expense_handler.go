package http

import (
	"net/http"
	"strconv"

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

func (h *ExpenseHandler) CreateExpense(c *gin.Context) {
	userID := c.GetString("user_id")

	title := c.PostForm("title")
	description := c.PostForm("description")
	amountStr := c.PostForm("amount")
	isSubmitted := c.PostForm("is_submitted") == "true"

	amount, err := strconv.ParseFloat(amountStr, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid amount format"})
		return
	}

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
	}

	expense, err := h.expenseUsecase.Create(userID, title, description, amount, receiptURL, isSubmitted)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Expense request created successfully",
		"data":    expense,
	})
}

func (h *ExpenseHandler) UpdateStatus(c *gin.Context) {
	expenseID := c.Param("id")
	role := c.GetString("role")
	userID := c.GetString("user_id")

	var req struct {
		Status string `json:"status" binding:"required"`
		Notes  string `json:"notes"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
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
	userID := c.GetString("user_id")
	role := c.GetString("role")
	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "10")
	search := c.Query("search")
	status := c.Query("status")

	page, err := strconv.Atoi(pageStr)
	if err != nil {
		page = 1
	}

	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		limit = 10
	}

	expenses, total, err := h.expenseUsecase.GetExpenses(page, limit, search, status, userID, role)
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
				"page":  page,
				"limit": limit,
				"total": total,
			},
		},
	})
}
