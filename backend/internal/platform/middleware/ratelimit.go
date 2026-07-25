package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/Akshansh-29072005/Deposity/backend/internal/platform/apperror"
)

type clientVisitor struct {
	lastSeen time.Time
	count    int
}

// RateLimiter tracks per-IP or per-identifier request frequencies
type RateLimiter struct {
	mu           sync.Mutex
	visitors     map[string]*clientVisitor
	limit        int
	window       time.Duration
	cleanupEvery time.Duration
}

// NewRateLimiter initializes a rate limiter allowing `limit` requests per `window` duration
func NewRateLimiter(limit int, window time.Duration) *RateLimiter {
	rl := &RateLimiter{
		visitors:     make(map[string]*clientVisitor),
		limit:        limit,
		window:       window,
		cleanupEvery: time.Minute * 5,
	}

	go rl.cleanupLoop()
	return rl
}

func (rl *RateLimiter) cleanupLoop() {
	for {
		time.Sleep(rl.cleanupEvery)
		rl.mu.Lock()
		for ip, v := range rl.visitors {
			if time.Since(v.lastSeen) > rl.window {
				delete(rl.visitors, ip)
			}
		}
		rl.mu.Unlock()
	}
}

// Middleware returns a Gin HandlerFunc enforcing the rate limit
func (rl *RateLimiter) Middleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Identify client by Tenant ID, User ID, or Client IP
		identifier := GetTenantID(c)
		if identifier == "" {
			identifier = c.ClientIP()
		}
		if identifier == "" {
			identifier = "unknown"
		}

		rl.mu.Lock()
		v, exists := rl.visitors[identifier]
		now := time.Now()

		if !exists || now.Sub(v.lastSeen) > rl.window {
			rl.visitors[identifier] = &clientVisitor{
				lastSeen: now,
				count:    1,
			}
			rl.mu.Unlock()
			c.Next()
			return
		}

		v.count++
		if v.count > rl.limit {
			rl.mu.Unlock()
			c.Header("Retry-After", "60")
			c.AbortWithStatusJSON(http.StatusTooManyRequests, apperror.New(http.StatusTooManyRequests, "Too many requests. Please wait before trying again."))
			return
		}

		v.lastSeen = now
		rl.mu.Unlock()
		c.Next()
	}
}
