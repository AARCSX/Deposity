 # AARCSX Deposity

[![Build Status](https://img.shields.io/badge/status-active-success.svg)]()
[![Next.js](https://img.shields.io/badge/Next.js-16.2.4-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-blue?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)

A professional-grade Logistics & Fleet Management System (FMS) built for the next generation of transportation services. The Platform (OnWay) provides a unified interface for managing trips, vehicles, drivers, and financial operations with real-time analytics and Material 3 design principles.

## 🚀 Key Features

### 📦 Trip & Logistics Management
- **Real-time Tracking**: Monitor active trips with load details and destination status.
- **Dynamic Load Monitoring**: Track specific materials (e.g., "15 MT Steel Coils") and weight-specific logistics.
- **Financial Flow**: Manage advances, balances, and revenue projections per trip.

### 🚛 Asset & Fleet Control
- **Vehicle Lifecycle**: Comprehensive tracking of vehicle documents, maintenance, and fitness certification.
- **Driver Performance**: Availability status, assignment history, and salary processing.
- **Expiry Alerts**: Proactive notifications for critical document renewals (Insurance, RC, Permit).

### 📊 Intelligence & Reporting
- **Decision Dashboard**: High-level view of active trips, revenue metrics, and pending actions.
- **Resource Analytics**: Utilization reports for the fleet and driver efficiency.
- **Action-Oriented UI**: Dedicated alerts for anomalies and critical pending tasks.

### 🏢 Enterprise Infrastructure
- **Company & Partner Management**: Manage clients and partner logistics firms.
- **Employee Portal**: Permission-based access for internal staff (Operations, HR, Finance).
- **Expense Tracking**: Granular tracking of operational costs.

## 🛠 Tech Stack

- **Framework**: [Next.js 16.2.4](https://nextjs.org) (App Router Architecture)
- **Library**: [React 19](https://react.dev)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) + Material Design 3 (M3) Token System
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Icons**: Material Symbols Outlined
- **Package Manager**: NPM/Yarn/PNPM/Bun

## 📁 Project Structure

```text
src/
├── app/                  # App Router: Pages and Layouts
│   ├── companies/        # Client & Partner Management
│   ├── drivers/          # Driver database and assignments
│   ├── employees/        # Internal staff management
│   ├── expenses/         # Financial tracking
│   ├── reports/          # Analytics and data exports
│   ├── settings/         # System configurations
│   ├── trips/            # Core logistics and route management
│   └── vehicles/         # Fleet management and document tracking
├── components/           # Reusable UI Architecture
│   ├── dashboard/        # Specialty metrics and info-cards
│   └── layout/           # Navigation, Sidebar, and Global Shells
└── styles/               # Global M3 tokens and core CSS
```

## 🚥 Getting Started

### Prerequisites
- Node.js 20.x or higher
- NPM / PNPM / Bun

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/jumbo-road-carrier.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env.local` file based on `.env.example` (if provided).

4. Launch Development Server:
   ```bash
   npm run dev
   ```

5. Build for Production:
   ```bash
   npm run build
   ```

## 🎨 Design System

The application strictly follows **Material Design 3 (M3)**. Color tokens are managed in [src/app/globals.css](src/app/globals.css) using a CSS variable system:
- Surfaces: `--surface-container-high`, `--surface-dim`
- Content: `--on-surface-variant`, `--outline-variant`
- Brand: `--primary`, `--primary-container`

## 🛡 License

Proprietary Software - All Rights Reserved.

---
*Built with ❤️ for Jumbo Road Carrier.*
