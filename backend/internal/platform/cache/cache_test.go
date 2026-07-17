package cache

import (
	"context"
	"errors"
	"sync"
	"sync/atomic"
	"testing"
	"time"
)

func TestFetch_FallbackNoRedis(t *testing.T) {
	// Ensure redisClient is nil for fallback testing
	redisClient = nil

	ctx := context.Background()
	key := "test:fallback:key"
	ttl := 1 * time.Minute

	type MockItem struct {
		Name string
		Val  int
	}

	callCount := int32(0)
	fetchFn := func() (*MockItem, error) {
		atomic.AddInt32(&callCount, 1)
		return &MockItem{Name: "hello", Val: 42}, nil
	}

	var dest MockItem
	err := Fetch(ctx, key, ttl, &dest, fetchFn)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if dest.Name != "hello" || dest.Val != 42 {
		t.Errorf("unexpected value in dest: %+v", dest)
	}

	if atomic.LoadInt32(&callCount) != 1 {
		t.Errorf("expected fetchFn to be called once, got %d", callCount)
	}
}

func TestFetch_ErrorPropagation(t *testing.T) {
	redisClient = nil
	ctx := context.Background()

	type MockItem struct {
		ID int
	}

	expectedErr := errors.New("database connection timeout")
	fetchFn := func() (*MockItem, error) {
		return nil, expectedErr
	}

	var dest MockItem
	err := Fetch(ctx, "test:error", 1*time.Minute, &dest, fetchFn)
	if !errors.Is(err, expectedErr) {
		t.Errorf("expected error %v, got %v", expectedErr, err)
	}
}

func TestFetch_ConcurrentConcurrency(t *testing.T) {
	// Verify that concurrent fetches work fine when redis is bypassed
	redisClient = nil
	ctx := context.Background()

	type MockVal struct {
		Data string
	}

	var wg sync.WaitGroup
	workers := 10
	results := make([]MockVal, workers)

	fetchFn := func() (*MockVal, error) {
		time.Sleep(10 * time.Millisecond) // simulate db latency
		return &MockVal{Data: "shared-data"}, nil
	}

	for i := 0; i < workers; i++ {
		wg.Add(1)
		go func(id int) {
			defer wg.Done()
			var dest MockVal
			_ = Fetch(ctx, "test:concurrent", 1*time.Minute, &dest, fetchFn)
			results[id] = dest
		}(i)
	}

	wg.Wait()

	for i, res := range results {
		if res.Data != "shared-data" {
			t.Errorf("worker %d got invalid result: %+v", i, res)
		}
	}
}
