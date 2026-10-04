package middleware

import (
	"internal-expense-backend/internal/usecase"
	"internal-expense-backend/pkg/response"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.Request.Method == http.MethodOptions {
			c.Error(response.NewAppError(
				response.ErrNotFound,
				"No content",
				nil,
			))
			return
		}

		tokenString, err := c.Cookie("token")
		if err != nil {
			c.Error(response.NewAppError(
				response.ErrAuth,
				"Unauthorized: No token provided",
				nil,
			))
			return
		}

		claims := &usecase.Claims{}
		secretKey := []byte(os.Getenv("JWT_SECRET"))

		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return secretKey, nil
		})

		if err != nil || !token.Valid {
			c.Error(response.NewAppError(
				response.ErrAuth,
				"Unauthorized: Invalid or expired token",
				err,
			))
			return
		}

		c.Set("user_id", claims.UserID)
		c.Set("email", claims.Email)
		c.Set("role", claims.Role)

		c.Next()
	}
}

func RBACMiddleware(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, exists := c.Get("role")
		if !exists {
			c.Error(response.NewAppError(
				response.ErrForbidden,
				"Forbidden: Role not found",
				nil,
			))
			return
		}

		roleStr, ok := userRole.(string)
		if !ok {
			c.Error(response.NewAppError(
				response.ErrForbidden,
				"Forbidden: Invalid role format",
				nil,
			))
			return
		}

		allowed := false
		for _, role := range allowedRoles {
			if roleStr == role {
				allowed = true
				break
			}
		}

		if !allowed {
			c.Error(response.NewAppError(
				response.ErrForbidden,
				"Forbidden: You do not have permission to access this resource",
				nil,
			))
			return
		}

		c.Next()
	}
}
