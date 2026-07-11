package apperror

import "net/http"

// AppError is a structured error type used across all handlers
// to return consistent JSON error responses.
type AppError struct {
	Code    int    `json:"-"`
	Message string `json:"error"`
}

// Error implements the error interface so AppError can be used as a standard Go error.
func (e *AppError) Error() string {
	return e.Message
}

// New creates a new AppError with the given HTTP status code and message.
func New(code int, message string) *AppError {
	return &AppError{Code: code, Message: message}
}

// --- Standard reusable errors ---

func NotFound(resource string) *AppError {
	return New(http.StatusNotFound, resource+" not found")
}

func BadRequest(message string) *AppError {
	return New(http.StatusBadRequest, message)
}

func Internal(message string) *AppError {
	return New(http.StatusInternalServerError, message)
}

func Conflict(message string) *AppError {
	return New(http.StatusConflict, message)
}
