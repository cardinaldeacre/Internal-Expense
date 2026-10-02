package middleware

import (
	"internal-expense-backend/pkg/response"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

func ErrorHandlingMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				log.Printf("[PANIC RECOVERED] %v\n", err)
				response.Error(c, http.StatusInternalServerError, "Internal server error")
			}
		}()

		c.Next()

		if len(c.Errors) == 0 && c.Writer.Status() == http.StatusNotFound {
			response.Error(c, http.StatusNotFound, "Resource not found")
			return
		}

		if len(c.Errors) == 0 && c.Writer.Status() == http.StatusMethodNotAllowed {
			response.Error(c, http.StatusMethodNotAllowed, "Method not allowed")
			return
		}
	}
}
