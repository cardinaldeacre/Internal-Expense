package middleware

import (
	"internal-expense-backend/pkg/response"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

func ErrorHandlingMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		if len(c.Errors) > 0 {
			err := c.Errors.Last().Err

			if appErr, ok := err.(*response.AppError); ok {
				log.Printf("[ERROR] %s: %v\n", appErr.Type, appErr.Err)

				var statusCode int
				switch appErr.Type {
				case response.ErrValidation:
					statusCode = http.StatusBadRequest
				case response.ErrAuth:
					statusCode = http.StatusUnauthorized
				case response.ErrForbidden:
					statusCode = http.StatusForbidden
				case response.ErrNotFound:
					statusCode = http.StatusNotFound
				case response.ErrConflict:
					statusCode = http.StatusConflict
				case response.ErrBusiness:
					statusCode = http.StatusUnprocessableEntity
				default:
					statusCode = http.StatusInternalServerError
				}

				msg := appErr.Message
				if statusCode == http.StatusInternalServerError {
					msg = "Error internal server."
				}

				response.Error(c, statusCode, msg)
				return
			}

			log.Printf("[UNHANDLED ERROR] %v\n", err)
			c.Error(response.NewAppError(
				response.ErrInternal,
				"Error internal server.",
				err,
			))
		}
	}
}
