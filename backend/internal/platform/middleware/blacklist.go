package middleware

import (
	"sync"
	"time"
)

type BlacklistStore struct {
	mu     sync.RWMutex
	tokens map[string]time.Time
}

// TokenBlacklist is the global registry of revoked JWT tokens.
var TokenBlacklist = NewBlacklistStore()

// NewBlacklistStore initializes a new blacklist token memory storage.
func NewBlacklistStore() *BlacklistStore {
	store := &BlacklistStore{
		tokens: make(map[string]time.Time),
	}
	// Start a background janitor to evict expired tokens every minute.
	go store.janitor(time.Minute)
	return store
}

// Add inserts a token hash to the blacklist.
func (s *BlacklistStore) Add(tokenHash string, expiresAt time.Time) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.tokens[tokenHash] = expiresAt
}

// IsBlacklisted returns true if the token hash is present and not expired.
func (s *BlacklistStore) IsBlacklisted(tokenHash string) bool {
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

func (s *BlacklistStore) janitor(interval time.Duration) {
	ticker := time.NewTicker(interval)
	for range ticker.C {
		s.cleanup()
	}
}

func (s *BlacklistStore) cleanup() {
	s.mu.Lock()
	defer s.mu.Unlock()
	now := time.Now()
	for hash, expiresAt := range s.tokens {
		if now.After(expiresAt) {
			delete(s.tokens, hash)
		}
	}
}
