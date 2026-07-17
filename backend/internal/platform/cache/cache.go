package cache

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"time"

	"github.com/redis/go-redis/v9"
	"golang.org/x/sync/singleflight"
)

var (
	redisClient *redis.Client
	sfGroup     singleflight.Group
)

// Initialize configures the global Redis cache client.
func Initialize(redisURL string) {
	if redisURL == "" {
		log.Println("[cache] WARNING: Redis URL is empty. Caching is disabled.")
		return
	}
	opts, err := redis.ParseURL(redisURL)
	if err != nil {
		log.Printf("[cache] ERROR: Failed to parse Redis URL %q: %v. Caching is disabled.", redisURL, err)
		return
	}

	redisClient = redis.NewClient(opts)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := redisClient.Ping(ctx).Err(); err != nil {
		log.Printf("[cache] ERROR: Failed to ping Redis at %s: %v. Caching is disabled.", opts.Addr, err)
		redisClient = nil
	} else {
		log.Printf("[cache] Connected to Redis successfully at %s. Caching enabled.", opts.Addr)
	}
}

// Fetch caches database query results. It uses singleflight to deduplicate concurrent requests.
// Key is the cache key.
// TTL is the time to live in Redis.
// Dest is the pointer where the result will be unmarshaled.
// FetchFn is the database function called on a cache miss.
func Fetch[T any](ctx context.Context, key string, ttl time.Duration, dest *T, fetchFn func() (*T, error)) error {
	// If Redis is not initialized, bypass cache and directly call fetchFn.
	if redisClient == nil {
		res, err := fetchFn()
		if err != nil {
			return err
		}
		if res != nil {
			*dest = *res
		}
		return nil
	}

	// 1. Try to read from Redis
	cachedData, err := redisClient.Get(ctx, key).Bytes()
	if err == nil {
		// Cache hit! Unmarshal and return.
		if err := json.Unmarshal(cachedData, dest); err == nil {
			return nil
		}
	}

	// 2. Cache miss! Use singleflight to run the database query only once.
	val, err, shared := sfGroup.Do(key, func() (interface{}, error) {
		// Double check in Redis first under the lock
		cachedData, err := redisClient.Get(ctx, key).Bytes()
		if err == nil {
			var cachedObj T
			if err := json.Unmarshal(cachedData, &cachedObj); err == nil {
				return &cachedObj, nil
			}
		}

		// Fetch from database
		res, err := fetchFn()
		if err != nil {
			return nil, err
		}
		if res == nil {
			return nil, errors.New("not found")
		}

		// Save to Redis
		serialized, err := json.Marshal(res)
		if err == nil {
			setErr := redisClient.Set(ctx, key, serialized, ttl).Err()
			if setErr != nil {
				log.Printf("[cache] ERROR: Failed to write cache key %q to Redis: %v", key, setErr)
			}
		}

		return res, nil
	})

	if err != nil {
		return err
	}

	if shared {
		log.Printf("[cache] Singleflight shared query executed for key: %s", key)
	}

	resTyped, ok := val.(*T)
	if !ok || resTyped == nil {
		return errors.New("cache: invalid type returned from singleflight")
	}

	*dest = *resTyped
	return nil
}

// Invalidate invalidates cache keys (e.g., after write/delete operations).
func Invalidate(ctx context.Context, keys ...string) {
	if redisClient == nil {
		return
	}
	for _, key := range keys {
		if err := redisClient.Del(ctx, key).Err(); err != nil {
			log.Printf("[cache] ERROR: Failed to delete cache key %q from Redis: %v", key, err)
		}
	}
}
