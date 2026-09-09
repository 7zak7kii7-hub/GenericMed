# GenericMed — Indian Generic Medicine Platform

A clinical, CDSCO-compliant, and Ayushman Bharat Digital Mission (ABDM) integrated generic medicine price comparison and fulfillment platform.

---

## 1. Project Architecture & Structure

The repository is organized into completely separated **`frontend/`** and **`backend/`** subfolders:

```text
GenericMed/
├── frontend/                     # React 19 + Vite 6 + Tailwind CSS v4 Client
│   ├── public/                   # Web App Manifest, Service Worker (PWA)
│   ├── src/
│   │   ├── components/           # UI Screens & Clinical Compliance Modals
│   │   ├── data/                 # Client Mock Catalog Data & Assets
│   │   ├── services/             # Typed API Client Service (api.ts)
│   │   ├── App.tsx               # Main Application Component
│   │   ├── index.css             # Design Tokens & Styles
│   │   └── types.ts              # Domain Interfaces
│   ├── .env                      # Frontend Environment Variables
│   ├── index.html                # Web App Entry HTML
│   ├── package.json              # Isolated Frontend Dependencies
│   ├── tsconfig.json             # Frontend TypeScript Configuration
│   └── vite.config.ts            # Vite Configuration & Reverse Proxy
│
├── backend/                      # Node.js + Express + Prisma + SQLite REST API
│   ├── prisma/                   # Database Schema & Seed Data
│   │   ├── schema.prisma         # Models (Users, Medicines, Orders, Logs)
│   │   └── seed.ts               # CDSCO Sample Medicine & Dispensary Seeder
│   ├── src/
│   │   ├── auth.ts               # JWT Auth, OTP Service & CDSCO Audit Logger
│   │   ├── db.ts                 # Prisma Client Singleton
│   │   ├── geminiService.ts      # Gemini 2.0 Flash Multimodal Vision OCR
│   │   ├── routes.ts             # Express REST API Endpoints
│   │   ├── server.ts             # Express Server Setup & Rate Limiting
│   │   └── types.ts              # Shared Domain Types
│   ├── .env                      # Backend Environment Variables
│   ├── package.json              # Isolated Backend Dependencies
│   └── tsconfig.json             # Backend TypeScript Configuration
│
├── k8s/                          # Kubernetes Deployment & Service Manifests
├── Dockerfile                    # Production Multi-Stage Container Build
├── docker-compose.yml            # Container Orchestration
├── README.md                     # Setup & Execution Documentation
└── .gitignore                    # Git Ignore Rules
```

---

## 2. Prerequisites

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- Optional: **Google Gemini API Key** (for live AI multimodal vision OCR; an offline clinical fallback engine is included by default).

---

## 3. Installation

### Quick 1-Step Installation (from Root)
You can install dependencies for both `frontend/` and `backend/` in a single command from the project root:

```bash
npm run install:all
```

---

### Manual Individual Installation

#### A. Install Backend Dependencies
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run db:seed
```

#### B. Install Frontend Dependencies
```bash
cd frontend
npm install
```

---

## 4. Environment Configuration

### Backend (`backend/.env`)
Create `backend/.env` (or copy from `backend/.env.example`):
```env
PORT=5000
DATABASE_URL="file:./dev.db"
GEMINI_API_KEY=""                 # Optional: Your Google Gemini API Key
JWT_SECRET="genericmed_cdsco_secret_key_2026"
NODE_ENV="development"
```

### Frontend (`frontend/.env`)
Create `frontend/.env` (or copy from `frontend/.env.example`):
```env
VITE_API_BASE_URL=/api
VITE_BACKEND_URL=http://localhost:5000
```

---

## 5. Running the Application

### Option 1: Running from Root (Recommended)

To run both services side-by-side:

- **Terminal 1 (Backend API)**:
  ```bash
  npm run dev:backend
  ```
  *Express API starts at `http://localhost:5000`*

- **Terminal 2 (Frontend Client)**:
  ```bash
  npm run dev:frontend
  ```
  *Vite web application starts at `http://localhost:3000`*

---

### Option 2: Running Individually in Respective Folders

#### Starting the Backend:
```bash
cd backend
npm run dev
```
Health check endpoint: `http://localhost:5000/api/health`

#### Starting the Frontend:
```bash
cd frontend
npm run dev
```
Open your browser at: `http://localhost:3000`

---

## 6. How Frontend & Backend Communicate

1. The frontend uses a typed API client in [frontend/src/services/api.ts](file:///c:/Users/asus/Desktop/pro1/GenericMed/frontend/src/services/api.ts) which sends standard HTTP requests to `VITE_API_BASE_URL` (defaulting to `/api`).
2. The Vite development server ([frontend/vite.config.ts](file:///c:/Users/asus/Desktop/pro1/GenericMed/frontend/vite.config.ts)) automatically reverse-proxies `/api/*` traffic to `http://localhost:5000/api/*`.
3. In production, the backend serves the built frontend bundle from `frontend/dist` or routes traffic via NGINX / Kubernetes ingress.

---

## 7. Key Features Implemented

1. **Molecule Bioequivalence Engine**: Side-by-side comparison of branded drugs vs. bio-identical generic equivalents with rupee and percentage savings calculations.
2. **Gemini 2.0 Flash Prescription OCR**: AI multimodal vision scanner converting doctor handwriting into digitized formulations and 1-click generic cart items.
3. **Hyperlocal Dispensary Multi-Tenancy**: Dispensary portal for neighborhood Jan Aushadhi Kendras with live batch inventory and Schedule H1 dispensing queue.
4. **10-Minute Batch Reservation Lock**: Prevents inventory double-allocation during checkout.
5. **Interactive Payment Gateway**: Dynamic UPI QR code (`upi://pay`), Cards, Net Banking, and split settlement ledger (Retailer 95%, Platform ₹5, Cold-chain ₹25).
6. **CDSCO GST Tax Invoice**: Form 20B/21B retail invoices with HSN 3004, 5% GST (2.5% CGST + 2.5% SGST), and registered pharmacist digital seals.
7. **Cold-Chain IoT Telemetry & OTP Handshake**: Live 18°C–24°C carrier temperature telemetry, route geolocation tracking, and courier doorstep 4-digit OTP handover verification.
8. **Ayushman Bharat Digital Mission (ABDM)**: 14-digit ABHA ID verification, Digital Health Card generation, and government hospital (AIIMS) e-prescription import.
9. **CDSCO Sugam National Registry**: Real-time batch recall verification against national drug safety alerts.
10. **PWA Offline Hardening**: Service Worker precaching and live network status indicators.

---

## 8. License & CDSCO Compliance Notice

This project complies with Rule 65 of the **Indian Drugs and Cosmetics Rules, 1945**, CDSCO guidelines for Form 20B/21B retail distribution, and National Health Authority (NHA) ABDM Sandbox Milestone guidelines.
