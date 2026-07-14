package middleware

import (
	"context"
	"log"
	"sync"
	"time"

	"github.com/redis/go-redis/v9"
)

// Blacklist defines the interface for token revocation.
type Blacklist interface {
	Add(tokenHash string, expiresAt time.Time)
	IsBlacklisted(tokenHash string) bool
}

// TokenBlacklist is the global registry of revoked JWT tokens.
var TokenBlacklist Blacklist = NewMemoryBlacklistStore()

// InitializeRedisBlacklist configures the blacklist to use Redis instead of memory cache.
func InitializeRedisBlacklist(redisURL string) {
	opts, err := redis.ParseURL(redisURL)
	if err != nil {
		log.Printf("[blacklist] WARNING: Failed to parse REDIS_URL %q: %v. Falling back to memory cache.", redisURL, err)
		return
	}

	client := redis.NewClient(opts)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		log.Printf("[blacklist] WARNING: Failed to connect to Redis at %s: %v. Falling back to memory cache.", opts.Addr, err)
		return
	}

	log.Printf("[blacklist] Connected to Redis successfully at %s. Enforcing Redis-backed blacklist.", opts.Addr)
	TokenBlacklist = &RedisBlacklistStore{client: client}
}

// ── In-Memory Blacklist Implementation ──

type MemoryBlacklistStore struct {
	mu     sync.RWMutex
	tokens map[string]time.Time
}

// NewMemoryBlacklistStore initializes a new blacklist token memory storage.
func NewMemoryBlacklistStore() *MemoryBlacklistStore {
	store := &MemoryBlacklistStore{
		tokens: make(map[string]time.Time),
	}
	// Start a background janitor to evict expired tokens every minute.
	go store.janitor(time.Minute)
	return store
}

// Add inserts a token hash to the memory blacklist.
func (s *MemoryBlacklistStore) Add(tokenHash string, expiresAt time.Time) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.tokens[tokenHash] = expiresAt
}

// IsBlacklisted returns true if the token hash is present and not expired in memory.
func (s *MemoryBlacklistStore) IsBlacklisted(tokenHash string) bool {
	s.mu.RLock()
	defer s.mu.RUnlock()
	expiresAt, exists := s.tokens[tokenHash]
	if !exists {
		return false
	}
	if time.Now().After(expiresAt) {
		return false
	}
	return true
}

func (s *MemoryBlacklistStore) janitor(interval time.Duration) {
	ticker := time.NewTicker(interval)
	for range ticker.C {
		s.cleanup()
	}
}

func (s *MemoryBlacklistStore) cleanup() {
	s.mu.Lock()
	defer s.mu.Unlock()
	now := time.Now()
	for hash, expiresAt := range s.tokens {
		if now.After(expiresAt) {
			delete(s.tokens, hash)
		}
	}
}

// ── Redis-Backed Blacklist Implementation ──

type RedisBlacklistStore struct {
	client *redis.Client
}

// Add inserts a token hash to the Redis blacklist with a TTL.
func (r *RedisBlacklistStore) Add(tokenHash string, expiresAt time.Time) {
	ttl := time.Until(expiresAt)
	if ttl <= 0 {
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	err := r.client.Set(ctx, "blacklist:"+tokenHash, "revoked", ttl).Err()
	if err != nil {
		log.Printf("[blacklist] ERROR: Failed to add token to Redis blacklist: %v", err)
	}
}

// IsBlacklisted returns true if the token key exists in Redis.
func (r *RedisBlacklistStore) IsBlacklisted(tokenHash string) bool {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	exists, err := r.client.Exists(ctx, "blacklist:"+tokenHash).Result()
	if err != nil {
		log.Printf("[blacklist] ERROR: Failed to check Redis blacklist: %v. Permitting fallback access.", err)
		return false
	}
	return exists > 0
}
