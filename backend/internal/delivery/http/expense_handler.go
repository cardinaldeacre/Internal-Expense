package http

import (
	"io"
	"log"
	"net/http"
	"net/url"
	"strconv"
	"strings"

	"internal-expense-backend/internal/usecase"
	"internal-expense-backend/pkg/response"
	"internal-expense-backend/pkg/utils"

	"github.com/gin-gonic/gin"
)

type ExpenseHandler struct {
	expenseUsecase *usecase.ExpenseUseCase
}

func NewExpenseHandler(expenseUsecase *usecase.ExpenseUseCase) *ExpenseHandler {
	return &ExpenseHandler{
		expenseUsecase: expenseUsecase,
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
			c.Error(response.NewAppError(
				response.ErrValidation,
				"Ukuran file struk melebihi batas 2MB",
				err,
			))
			return
		}

		contentType := file.Header.Get("Content-Type")
		if contentType != "image/jpeg" && contentType != "image/png" && contentType != "application/pdf" {
			c.Error(response.NewAppError(
				response.ErrValidation,
				"Jenis file struk tidak valid. Hanya file JPEG, PNG, dan PDF yang diperbolehkan",
				err,
			))
			return
		}

		receiptURL, err = utils.UploadToMinIO(file)
		if err != nil {
			c.Error(response.NewAppError(
				response.ErrInternal,
				"Gagal mengunggah struk ke penyimpanan cloud",
				err,
			))
			return
		}
	} else if req.IsSubmitted {
		c.Error(response.NewAppError(
			response.ErrValidation,
			"Struk diperlukan saat mengajukan pengeluaran",
			nil,
		))
		return
	}

	expense, err := h.expenseUsecase.Create(userID, req.Title, req.Description, req.Amount, receiptURL, req.IsSubmitted)
	if err != nil {
		c.Error(response.NewAppError(
			response.ErrInternal,
			"Gagal membuat pengeluaran",
			err,
		))
		return
	}

	response.Success(c, http.StatusCreated, "Expense request created successfully", expense)
}

type UpdateExpenseStatusReq struct {
	Status string `json:"status" binding:"required,oneof=APPROVED REJECTED SUBMITTED PAID"`
	Notes  string `json:"notes" binding:"omitempty,max=255"`
}

func (h *ExpenseHandler) UpdateStatus(c *gin.Context) {
	expenseID := c.Param("id")
	role := c.GetString("role")
	userID := c.GetString("user_id")

	var req UpdateExpenseStatusReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.Error(response.NewAppError(
			response.ErrValidation,
			"Invalid request body: "+err.Error(),
			err,
		))
		return
	}

	err := h.expenseUsecase.UpdateStatus(expenseID, role, userID, req.Status, req.Notes)
	if err != nil {
		c.Error(response.NewAppError(
			response.ErrInternal,
			"Failed to update expense status: "+err.Error(),
			err,
		))
		return
	}

	response.Success(c, http.StatusOK, "Expense status updated successfully", nil)
}

func (h *ExpenseHandler) GetExpenses(c *gin.Context) {
	var query GetExpenseQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.Error(response.NewAppError(
			response.ErrValidation,
			"Invalid query parameters: "+err.Error(),
			err,
		))
		return
	}

	userID := c.GetString("user_id")
	role := c.GetString("role")

	expenses, total, err := h.expenseUsecase.GetExpenses(query.Page, query.Limit, query.Search, query.Status, userID, role)
	if err != nil {
		c.Error(response.NewAppError(
			response.ErrInternal,
			"Failed to retrieve expenses: "+err.Error(),
			err,
		))
		return
	}

	response.Success(c, http.StatusOK, "Expenses retrieved successfully", gin.H{
		"items": expenses,
		"meta": gin.H{
			"page":  query.Page,
			"limit": query.Limit,
			"total": total,
		},
	},
	)
}

func (h *ExpenseHandler) GetReceiptImage(c *gin.Context) {
	expenseID := c.Param("id")

	expense, err := h.expenseUsecase.GetExpenseByID(expenseID)
	if err != nil {
		c.Error(response.NewAppError(
			response.ErrNotFound,
			"Expense not found",
			err,
		))
		return
	}

	if expense.ReceiptURL == "" {
		c.Error(response.NewAppError(
			response.ErrNotFound,
			"Receipt not found",
			nil,
		))
		return
	}

	receiptValue := expense.ReceiptURL
	objectKey := receiptValue

	if strings.HasPrefix(receiptValue, "http://") ||
		strings.HasPrefix(receiptValue, "https://") {

		parsedURL, err := url.Parse(receiptValue)
		if err != nil {
			c.Error(response.NewAppError(
				response.ErrValidation,
				"Invalid receipt URL",
				err,
			))
			return
		}

		path := strings.TrimPrefix(parsedURL.Path, "/")
		parts := strings.SplitN(path, "/", 2)

		if len(parts) != 2 {
			c.Error(response.NewAppError(
				response.ErrValidation,
				"Invalid receipt URL",
				nil,
			))
			return
		}

		objectKey = parts[1]
	}

	body, contentLength, contentType, err := utils.GetFileFromMinIO(objectKey)
	if err != nil {
		c.Error(response.NewAppError(
			response.ErrNotFound,
			"Receipt file not found",
			err,
		))
		return
	}

	defer body.Close()

	c.Header("Content-Type", contentType)

	if contentLength > 0 {
		c.Header("Content-Length", strconv.FormatInt(contentLength, 10))
	}

	c.Status(http.StatusOK)

	if _, err := io.Copy(c.Writer, body); err != nil {
		log.Printf("[Receipt] Failed to stream receipt: %v", err)
	}
}
