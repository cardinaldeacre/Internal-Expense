package middleware

import (
	"internal-expense-backend/pkg/response"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func CSRFMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		method := c.Request.Method
		if method == "GET" || method == "HEAD" || method == "OPTIONS" {
			c.Next()
			return
		}

		if strings.HasPrefix(c.Request.URL.Path, "/api/v1/auth/login") {
			c.Next()
			return
		}

		cookieToken, err := c.Cookie("csrf_token")
		headerToken := c.GetHeader("X-CSRF-Token")

		if err != nil || headerToken == "" || cookieToken != headerToken {
			response.Error(c, http.StatusForbidden, "Access denied: invalid CSRF token")
			c.Abort()
			return
		}

		c.Next()
	}
}
