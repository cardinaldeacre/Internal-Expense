package response

import (
	"fmt"

	"github.com/gin-gonic/gin"
)

type APIResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

func Success(c *gin.Context, statusCode int, message string, data interface{}) {
	c.JSON(statusCode, APIResponse{Success: true, Message: message, Data: data})
}

func Error(c *gin.Context, statusCode int, message string) {
	c.AbortWithStatusJSON(statusCode, APIResponse{Success: false, Message: message})
}

type ErrorType string

const (
	ErrAuth       ErrorType = "AUTHENTICATION_ERROR"
	ErrForbidden  ErrorType = "AUTHORIZATION_ERROR"
	ErrValidation ErrorType = "VALIDATION_ERROR"
	ErrNotFound   ErrorType = "NOT_FOUND"
	ErrConflict   ErrorType = "CONFLICT"
	ErrBusiness   ErrorType = "BUSINESS_ERROR"
	ErrInternal   ErrorType = "INTERNAL_ERROR"
)

type AppError struct {
	Type    ErrorType
	Message string
	Err     error
}

func (e *AppError) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("%s: %v", e.Message, e.Err)
	}
	return e.Message
}

func NewAppError(errType ErrorType, message string, err error) *AppError {
	return &AppError{
		Type:    errType,
		Message: message,
		Err:     err,
	}
}
