package apperror

import (
	"errors"
	"net/http"
	"strings"

	"github.com/jackc/pgx/v5/pgconn"
)

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

// FromDBError checks if the error is a PostgreSQL database violation
// and maps it to a friendly user-facing AppError.
func FromDBError(err error) error {
	if err == nil {
		return nil
	}
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) {
		if pgErr.Code == "23505" { // Unique violation
			constraint := pgErr.ConstraintName
			if constraint == "" {
				constraint = pgErr.Message
			}

			if strings.Contains(constraint, "registration_number") {
				return Conflict("A vehicle with this registration number is already registered.")
			}
			if strings.Contains(constraint, "phone") {
				return Conflict("A driver with this phone number is already registered.")
			}
			if strings.Contains(constraint, "license_number") {
				return Conflict("A driver with this license number is already registered.")
			}
			if strings.Contains(constraint, "slug") {
				return Conflict("This organization slug is already taken.")
			}
			return Conflict("A record with these details already exists.")
		}
	}
	return err
}

// Resolve maps any error to HTTP status code and clean error message.
func Resolve(err error) (int, any) {
	if err == nil {
		return http.StatusOK, nil
	}
	var appErr *AppError
	if errors.As(err, &appErr) {
		return appErr.Code, map[string]string{"error": appErr.Message}
	}
	return http.StatusInternalServerError, map[string]string{"error": "An unexpected error occurred. Please try again."}
}
