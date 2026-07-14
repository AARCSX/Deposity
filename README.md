# AARCSX Deposity — Fleet & Operations Management System

This repository contains the source code for the backend and frontend services of Deposity, integrated with the AARCSX Identity platform.

## 📁 Repository Structure
- `backend/`: Go REST API backend (built with Gin, PostgreSQL/pgx, and Brevo client).
- `frontend/`: Next.js 16 (App Router) frontend utilizing Material Design 3 and Tailwind CSS.
- `docker-compose.yml`: Standard container orchestration for running the entire system locally.

## 🚀 Getting Started

### Local Development with Docker
1. Configure environment variables in `backend/.env` (using `backend/.env.example` as a template).
2. Configure environment variables in `frontend/.env.local` (using `frontend/.env.example` as a template).
3. Run the following command:
   ```bash
   docker-compose up --build
   ```
4. Access the frontend at `http://localhost:3000` and the backend at `http://localhost:8080`.

---

## 🛡️ IMPORTANT SECURITY WARNING

> [!WARNING]
> **Secret Rotation and Git History Safety**
>
> If any secrets (such as Brevo API keys, database connection strings, JWT/OIDC signing keys, or Supabase credentials) were previously hardcoded in the codebase, **they are still preserved in the git history**.
> 
> You **MUST** rotate all credentials immediately before deploying to production:
> - Rotate your Brevo API Keys.
> - Reset and change your Neon/PostgreSQL database passwords.
> - Generate new JWT secrets or client keys on AARCSX Identity.
