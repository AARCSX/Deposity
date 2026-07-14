package mail

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type Client struct {
	apiKey      string
	senderEmail string
}

func NewClient(apiKey, senderEmail string) *Client {
	return &Client{
		apiKey:      apiKey,
		senderEmail: senderEmail,
	}
}

type brevoRecipient struct {
	Email string `json:"email"`
	Name  string `json:"name,omitempty"`
}

type brevoSender struct {
	Name  string `json:"name"`
	Email string `json:"email"`
}

type brevoPayload struct {
	Sender      brevoSender      `json:"sender"`
	To          []brevoRecipient `json:"to"`
	Subject     string           `json:"subject"`
	HTMLContent string           `json:"htmlContent"`
}

func (c *Client) SendWelcomeEmail(toEmail, toName, orgName, orgSlug, tenantID string) error {
	if c.apiKey == "" {
		return fmt.Errorf("brevo API key is not configured")
	}

	htmlContent := fmt.Sprintf(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Welcome to AARCSX Deposity</title>
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #030712;
      color: #f3f4f6;
      margin: 0;
      padding: 40px 20px;
    }
    .card {
      max-width: 580px;
      margin: 0 auto;
      background: #0f172a;
      border: 1px solid rgba(99, 102, 241, 0.15);
      border-radius: 24px;
      padding: 40px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    }
    .logo {
      color: #6366f1;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: 0.15em;
      margin-bottom: 30px;
      text-transform: uppercase;
      text-align: center;
    }
    h1 {
      color: #f3f4f6;
      font-size: 28px;
      font-weight: 600;
      margin-top: 0;
      margin-bottom: 16px;
      text-align: center;
    }
    p {
      color: #94a3b8;
      line-height: 1.7;
      font-size: 15px;
      margin-top: 0;
      margin-bottom: 24px;
    }
    .setup-box {
      background: #090d16;
      border: 1px solid rgba(99, 102, 241, 0.2);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 30px;
    }
    .setup-title {
      color: #818cf8;
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 16px;
    }
    .setup-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      font-size: 14px;
    }
    .setup-row:last-child {
      margin-bottom: 0;
    }
    .label {
      color: #64748b;
    }
    .value {
      color: #e2e8f0;
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
      font-weight: 500;
    }
    .btn {
      display: block;
      background: #6366f1;
      color: #ffffff !important;
      text-align: center;
      padding: 14px 24px;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 600;
      font-size: 15px;
      transition: background 0.2s ease;
      margin-top: 30px;
    }
    .btn:hover {
      background: #4f46e5;
    }
    .footer {
      text-align: center;
      color: #475569;
      font-size: 12px;
      margin-top: 30px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">Deposity</div>
    <h1>Welcome to Deposity!</h1>
    <p>Hello %s,</p>
    <p>Your organization <strong>%s</strong> is now successfully connected to Deposity. You are ready to manage your fleet, drivers, trips, maintenance logs, and fuel cards from a single premium portal.</p>
    
    <div class="setup-box">
      <div class="setup-title">Your Environment Settings</div>
      <div class="setup-row">
        <span class="label">Organization Slug:</span>
        <span class="value" style="color: #818cf8;">%s</span>
      </div>
      <div class="setup-row">
        <span class="label">Tenant ID:</span>
        <span class="value">%s</span>
      </div>
    </div>

    <p>Use your organization credentials alongside your OIDC login email to access the dashboard at any time.</p>

    <a href="https://deposity.aarcsx.com/dashboard" class="btn">Launch Dashboard</a>
    
    <div class="footer">
      &copy; 2026 Deposity. All rights reserved.
    </div>
  </div>
</body>
</html>`, toName, orgName, orgSlug, tenantID)

	payload := brevoPayload{
		Sender: brevoSender{
			Name:  "AARCSX Deposity",
			Email: c.senderEmail,
		},
		To: []brevoRecipient{
			{
				Email: toEmail,
				Name:  toName,
			},
		},
		Subject:     fmt.Sprintf("Welcome to AARCSX Deposity - Onboarding Complete"),
		HTMLContent: htmlContent,
	}

	bodyBytes, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal payload: %w", err)
	}

	req, err := http.NewRequest("POST", "https://api.brevo.com/v3/smtp/email", bytes.NewBuffer(bodyBytes))
	if err != nil {
		return fmt.Errorf("failed to create http request: %w", err)
	}

	req.Header.Set("accept", "application/json")
	req.Header.Set("api-key", c.apiKey)
	req.Header.Set("content-type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send post request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("unexpected status code from Brevo API: %d", resp.StatusCode)
	}

	return nil
}
