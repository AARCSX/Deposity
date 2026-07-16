package apperror

import (
	"errors"
	"net/http"
	"testing"

	"github.com/jackc/pgx/v5/pgconn"
)

func TestFromDBError(t *testing.T) {
	tests := []struct {
		name          string
		err           error
		expectedMsg   string
		expectedCode  int
		shouldTrigger bool
	}{
		{
			name: "Registration Number Unique Violation",
			err: &pgconn.PgError{
				Code:           "23505",
				ConstraintName: "vehicles_registration_number_key",
			},
			expectedMsg:   "A vehicle with this registration number is already registered.",
			expectedCode:  http.StatusConflict,
			shouldTrigger: true,
		},
		{
			name: "Driver Phone Unique Violation",
			err: &pgconn.PgError{
				Code:           "23505",
				ConstraintName: "drivers_phone_key",
			},
			expectedMsg:   "A driver with this phone number is already registered.",
			expectedCode:  http.StatusConflict,
			shouldTrigger: true,
		},
		{
			name: "Driver License Unique Violation",
			err: &pgconn.PgError{
				Code:           "23505",
				ConstraintName: "drivers_license_number_key",
			},
			expectedMsg:   "A driver with this license number is already registered.",
			expectedCode:  http.StatusConflict,
			shouldTrigger: true,
		},
		{
			name: "Company Slug Unique Violation",
			err: &pgconn.PgError{
				Code:           "23505",
				ConstraintName: "companies_slug_key",
			},
			expectedMsg:   "This organization slug is already taken.",
			expectedCode:  http.StatusConflict,
			shouldTrigger: true,
		},
		{
			name: "Generic Unique Violation",
			err: &pgconn.PgError{
				Code:           "23505",
				ConstraintName: "some_other_key",
			},
			expectedMsg:   "A record with these details already exists.",
			expectedCode:  http.StatusConflict,
			shouldTrigger: true,
		},
		{
			name: "Non-23505 DB Error",
			err: &pgconn.PgError{
				Code: "23503", // Foreign key violation
			},
			shouldTrigger: false,
		},
		{
			name:          "Non-DB Error",
			err:           errors.New("some standard error"),
			shouldTrigger: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := FromDBError(tt.err)
			if tt.shouldTrigger {
				var appErr *AppError
				if !errors.As(result, &appErr) {
					t.Fatalf("expected AppError, got %T", result)
				}
				if appErr.Code != tt.expectedCode {
					t.Errorf("expected code %d, got %d", tt.expectedCode, appErr.Code)
				}
				if appErr.Message != tt.expectedMsg {
					t.Errorf("expected message %q, got %q", tt.expectedMsg, appErr.Message)
				}
			} else {
				if result != tt.err {
					t.Errorf("expected original error to be returned, got %v", result)
				}
			}
		})
	}
}

func TestResolve(t *testing.T) {
	tests := []struct {
		name         string
		err          error
		expectedCode int
		expectedMsg  string
	}{
		{
			name:         "Nil Error",
			err:          nil,
			expectedCode: http.StatusOK,
			expectedMsg:  "",
		},
		{
			name:         "Conflict AppError",
			err:          Conflict("already exists"),
			expectedCode: http.StatusConflict,
			expectedMsg:  "already exists",
		},
		{
			name:         "Standard Error",
			err:          errors.New("internal server issue"),
			expectedCode: http.StatusInternalServerError,
			expectedMsg:  "An unexpected error occurred. Please try again.",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			code, resObj := Resolve(tt.err)
			if code != tt.expectedCode {
				t.Errorf("expected code %d, got %d", tt.expectedCode, code)
			}
			if tt.err == nil {
				if resObj != nil {
					t.Errorf("expected nil body, got %v", resObj)
				}
				return
			}
			body, ok := resObj.(map[string]string)
			if !ok {
				t.Fatalf("expected map[string]string response body, got %T", resObj)
			}
			msg := body["error"]
			if msg != tt.expectedMsg {
				t.Errorf("expected message %q, got %q", tt.expectedMsg, msg)
			}
		})
	}
}
