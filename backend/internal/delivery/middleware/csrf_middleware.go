package middleware

import (
	"fmt"
	"internal-expense-backend/pkg/response"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func CSRFMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.Request.Method == http.MethodOptions {
			c.Error(response.NewAppError(
				response.ErrNotFound,
				"No content",
				nil,
			))
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
			internalErr := err
			if internalErr == nil {
				internalErr = fmt.Errorf("header token: '%s', cookie token: '%s'", headerToken, cookieToken)
			}

			c.Error(response.NewAppError(
				response.ErrForbidden,
				"Akses ditolak: Token CSRF tidak valid",
				internalErr,
			))

			c.Abort()
		}

		c.Next()
	}
}
