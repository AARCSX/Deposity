package middleware

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

// Recovery returns a Gin middleware that recovers from panics and returns
// a structured JSON 500 error instead of crashing the process.
// This is critical for Cloud Run where a crash restarts the entire container.
func Recovery() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				log.Printf("[recovery] PANIC recovered: %v", err)
				c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
					"error": "an unexpected internal error occurred",
				})
			}
		}()
		c.Next()
	}
}
