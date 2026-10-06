package middleware

import (
	"crypto/subtle"
	"fmt"
	"internal-expense-backend/pkg/response"
	"net/http"

	"github.com/gin-gonic/gin"
)

func CSRFMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		switch c.Request.Method {
		case http.MethodGet, http.MethodHead, http.MethodOptions, http.MethodTrace:
			c.Next()
			return
		}

		if c.Request.URL.Path == "/api/v1/auth/login" {
			c.Next()
			return
		}

		cookieToken, err := c.Cookie("csrf_token")
		headerToken := c.GetHeader("X-CSRF-Token")

		valid := err == nil &&
			headerToken != "" &&
			subtle.ConstantTimeCompare([]byte(cookieToken), []byte(headerToken)) == 1

		if !valid {
			internalErr := err
			if internalErr == nil {
				internalErr = fmt.Errorf("csrf token mismatch or header missing")
			}
			_ = c.Error(response.NewAppError(
				response.ErrForbidden,
				"Akses ditolak: Token CSRF tidak valid",
				internalErr,
			))
			c.Abort()
			return
		}

		c.Next()
	}
}
