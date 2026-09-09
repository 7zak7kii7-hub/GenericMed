# Changelog

All notable changes to the **GenericMed** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- Pan-India multi-region hospital network federated query caching.
- Advanced clinical drug-drug interaction (DDI) contraindication warning graph.

## [0.9.0] - 2026-09-09

### Changed - Architectural Decoupling & Modular Monorepo
- **Complete Decoupling into Standalone Subfolders**:
  - Restructured the entire workspace into independent `frontend/` and `backend/` subdirectories.
  - **`frontend/`**: Contains React 19, Vite, Tailwind CSS v4, Lucide icons, components, pages, public PWA assets, `vite-env.d.ts`, and standalone `package.json` + `tsconfig.json`.
  - **`backend/`**: Contains Express 4, Prisma SQLite ORM, Gemini 2.5 Flash Vision OCR, CDSCO compliance audit trails, security middleware (Helmet, CORS, rate-limiters), and standalone `package.json` + `tsconfig.json`.
- **Pure API Communication Protocol**:
  - Frontend services (`frontend/src/services/api.ts`) communicate strictly with the backend via HTTP REST endpoints (`/api/*`), configured with Vite dev proxy and dynamic `VITE_API_BASE_URL`.
  - Isolated mock data and domain types into both subfolders to eliminate cross-subfolder relative imports.
- **Root Workspace Automation**:
  - Root `package.json` with npm convenience scripts (`install:all`, `dev:frontend`, `dev:backend`, `build:frontend`, `build:backend`, `lint:frontend`, `lint:backend`, `db:*`).
  - Multi-stage `Dockerfile` and `docker-compose.yml` updated to build frontend and backend independently in container stages.
  - Root `README.md` updated with comprehensive instructions for running together or independently.
  - Redundant root source code files cleanly purged.

---

## [0.8.0] - 2026-09-09

### Added
- **Ayushman Bharat Digital Mission (ABDM) Integration (`AbhaSyncModal.tsx`)**:
  - 14-digit ABHA Number (`91-4829-1029-4819`) and ABHA Address (`rahul.sharma@abdm`) validation with Aadhaar OTP authentication (`482910`).
  - Government of India **Digital ABHA Health Card** generator with scan-ready QR code and official National Health Authority branding.
  - Linked Government Hospital electronic health records (EHR) e-prescription viewer (AIIMS New Delhi, Safdarjung Hospital).
  - 1-Click "Import to Vault & Find Generics" converting government EHR prescriptions into persistent digital prescriptions with automated generic substitution and cart bundle creation.
  - Quick-access "Sync ABHA" launcher in `PrescriptionsScreen.tsx` and "ABHA ID" button in `Header.tsx`.
  - Endpoints: `POST /api/abdm/verify-abha`, `GET /api/abdm/ehr-prescriptions`, and `POST /api/abdm/import-prescription`.
- **CDSCO Sugam National Drug Recall Registry (`CdscoSugamModal.tsx`)**:
  - Live national registry monitoring connecting to CDSCO drug safety surveillance.
  - Real-time batch recall verification (`GET /api/cdsco/sugam/verify-batch/:batchNumber`) alerting pharmacists and patients of substandard lots (e.g. `RECALL-DOLO-99`).
  - National bulletins browser displaying circular IDs, active salts, affected manufacturers, risk tiers, and regulatory recall actions.
  - "Sugam" quick-access launcher in `Header.tsx`.
- **Enterprise Cloud Scaling & Containerization**:
  - Production multi-stage `Dockerfile` with minimal Node 20 Alpine runtime.
  - `docker-compose.yml` orchestrating web app, API server, and persistent database volumes.
  - Kubernetes manifests (`k8s/deployment.yaml`, `k8s/service.yaml`) configuring 3-pod rolling updates, CPU/memory quotas, and liveness/readiness probes.
  - System telemetry and Kubernetes cluster metrics endpoint (`GET /api/metrics`).

---

## [0.7.0] - 2026-09-09

### Added
- **IoT Cold-Chain Telemetry Cockpit (`ColdChainTelemetryCard.tsx`)**:
  - Live temperature readout with dynamic color coding (18°C–24°C optimal range).
  - SVG sparkline thermal curve rendering real-time fluctuations over transit history.
  - Bluetooth BLE beacon telemetry (Sensor ID `#BLE-TEMPSENSE-049`, battery 94%, tamper-evident RFID lid seal status).
  - Interactive "Simulate Temp Breach" test toggle triggering real-time CDSCO thermal violation alerts and automatic audit logging.
  - Endpoints: `GET /api/orders/:id/telemetry`, `POST /api/orders/:id/telemetry/simulate-breach`, `POST /api/orders/:id/telemetry/log`.
- **Dynamic Courier Geolocation & Delivery Route Animation (`OrderTrackingScreen.tsx`)**:
  - Real-time animated courier icon moving along SVG road geometry towards customer address.
  - Dynamic distance countdown (1.4 km -> 0.2 km -> arrived) and synchronized ETA counter.
  - Recenter map button with live GPS coordinates feedback (`12.9784° N, 77.6408° E`).
- **Cryptographic 4-Digit Delivery OTP Handshake Terminal (`DeliveryHandshakeModal.tsx`)**:
  - Simulated courier handheld terminal (Rider Suresh K.) allowing PIN entry to complete doorstep custody transfer.
  - Auto-fill patient OTP helper button for rapid testing and evaluation.
  - Endpoint `POST /api/orders/:id/verify-delivery-otp`: verifies 4-digit PIN against order record, transitions status to `DELIVERED`, and generates CDSCO Form 20B digital handover certificate.
  - Order tracking screen transitions to completed doorstep state with Form 20B receipt and invoice download links.
- **Progressive Web App (PWA) Offline Hardening (`public/manifest.webmanifest`, `public/sw.js`, `OfflineBanner.tsx`)**:
  - Web App Manifest configured for standalone display, clinical deep teal branding (`#005048`), and shortcuts.
  - Service Worker (`sw.js`) implementing offline-first caching for application shell, static assets, and cached medicine catalog.
  - Floating `OfflineBanner.tsx` alerting users when network drops and confirming cloud sync restoration when connection resumes.

---

## [0.6.0] - 2026-09-09

### Added
- **Hyperlocal Dispensary Multi-Tenant Portal (`DispensaryPortalModal.tsx`)**:
  - Pharmacist dashboard supporting multi-dispensary tenant switching (Jan Aushadhi Kendra #104, Apollo Pharmacy Central, MedPlus Indiranagar, Wellness Forever).
  - Real-time batch inventory ledger displaying stock levels, batch numbers, manufacturer names, and expiry dates.
  - Interactive batch ingestion sub-modal (`POST /api/pharmacies/:id/inventory/add`) for updating generic stocks and Schedule H1 inventory.
  - Prescription dispensing queue with 1-click Registered Pharmacist CDSCO digital stamp sign-off (`POST /api/orders/:id/dispense`).
  - Dispensary Hub quick-access launcher in `Header.tsx` for `PHARMACIST` and `ADMIN` roles.
- **Inventory Batch Reservation Engine (`/api/inventory/reserve` & `/api/inventory/release`)**:
  - 10-minute temporary inventory reservation lock preventing stock race conditions and double-allocation during high-demand checkout.
  - Live 10-minute reservation countdown timer badge in `CartScreen.tsx`.
  - Automatic release and expiration of stale batch reservations.
- **Interactive Payment Gateway Modal (`PaymentGatewayModal.tsx`)**:
  - Comprehensive simulated payment modal supporting Dynamic UPI QR code (UPI intent `upi://pay`), UPI VPA ID, Credit/Debit Cards, and Net Banking.
  - Automated split settlement accounting: Retailer payout (95% subtotal) vs. Platform fee (₹5.00) & Cold-chain packaging fee (₹25.00).
  - Idempotent transaction verification (`POST /api/payments/verify`) triggering automatic inventory batch stock decrement.
  - Resilient client-side fallback with simulated transaction processing when backend is offline.
- **Dynamic CDSCO GST Tax Invoice Engine (`TaxInvoiceModal.tsx`)**:
  - Full Form 20B/21B medical tax invoice generator supporting dynamic order lookup (`GET /api/orders/:id/invoice`).
  - HSN code 3004 tax classification with 5% GST breakdown (2.5% CGST + 2.5% SGST).
  - Displays dispensary Drug License (DL) numbers, batch identification codes, and registered pharmacist digital stamp.
  - Quick-action buttons for downloading official PDF or printing Form 20B tax invoices.

### Changed
- **Cart Checkout Integration (`CartScreen.tsx`)**:
  - Connected checkout action to launch the interactive `PaymentGatewayModal` with live split settlement calculations and auto-reserving batch stock.
- **Application Shell State (`App.tsx`)**:
  - Managed state bindings for `PaymentGatewayModal` and `DispensaryPortalModal`.
  - Automated post-payment transitions from cart to real-time `OrderTrackingScreen`.

---

## [0.5.0] - 2026-09-09

### Added
- **Gemini 2.0 Flash Multimodal Vision Pipeline (`geminiService.ts` & `UploadPrescriptionModal.tsx`)**:
  - Live AI OCR analyzing doctor name, registration number, clinic, date, patient details, and prescribed medicines.
  - Automatic CDSCO generic substitution mapping with standard Indian MRP vs Generic Price and percentage savings calculations.
  - Preset doctor prescriptions (Acute Fever & Antibiotics, Cardiology & BP, Diabetic Care) and custom file upload support (JPG/PNG/PDF).
  - Confidence scoring HUD and manual pharmacist review indicators.
  - Direct conversion of detected medicines into cart items with batch numbers and generic packaging details.
- **Persistent Database & Prisma Schema (`prisma/schema.prisma` & `prisma/seed.ts`)**:
  - SQLite/PostgreSQL schema supporting `users`, `medicines`, `active_salts`, `brand_generic_mappings`, `pharmacies`, `prescriptions`, `orders`, `cold_chain_logs`, and `audit_logs`.
  - Prisma query and mutation persistence for prescriptions, orders, and audit records with resilient fallback.
- **Role-Based Access Control & CDSCO Audit Ledger (`AuthModal.tsx` & `CdscoAuditModal.tsx`)**:
  - OTP mobile login supporting `PATIENT`, `PHARMACIST`, and `ADMIN` roles.
  - Quick 1-click test role switcher.
  - Schedule H1 Regulatory Audit Trail modal allowing certified pharmacists to inspect Form 20B/21B compliance and inventory logs.
- **Client API Service Layer (`src/services/api.ts`)**:
  - Unified typed API client with zero-downtime offline fallback mechanisms.
- **Vite Reverse Proxy (`vite.config.ts`)**:
  - Configured `/api` proxying to the Express backend on port 5000.

### Fixed
- Fixed missing `prisma` import in `src/server/routes.ts` that caused a ReferenceError on the `/audit/h1-records` endpoint.
- Corrected type signatures and missing `onNavigate` prop in `App.tsx` for `CompareScreen`.

## [0.4.0] - 2025-03-08

### Added
- **Prescriptions Management (`PrescriptionsScreen.tsx`)**:
  - Digital prescription vault listing verified doctor names, clinics, and date of issue.
  - Interactive prescription status pills (`Verified & Digitized`, `Analyzing AI OCR`, `Order Ready`).
  - Integrated `UploadPrescriptionModal` with multi-step OCR parsing simulation.
- **AI Persistent Knowledge & Context Base**:
  - `decisions.md`: Architecture Decision Records (ADRs 001–007) documenting molecule matching, normalized pricing, CDSCO compliance, and multi-tenant dispensaries.
  - `rules.md`: Strict engineering standards, folder structures, naming conventions, UI/UX tokens, and security constraints.
  - `memory.md`: Long-term technical overview, database schema ER diagram, API contract, and business logic formulas.
  - `changelog.md`: Chronological versioning and release notes.

### Changed
- Refactored `App.tsx` navigation to support direct deep-linking between prescription items and comparison search.
- Updated `Header.tsx` notification counter badge to dynamically sync with unread notification records.

### Fixed
- Fixed layout overflowing on small mobile screens (<360px) in the comparison card price badges.
- Standardized modal backdrop click listeners to prevent unintended modal closure during text selection.

---

## [0.3.0] - 2025-02-28

### Added
- **Cold-Chain Telemetry & Secure OTP Delivery (`OrderTrackingScreen.tsx`)**:
  - Live carrier temperature monitor (18°C–24°C / 4.8°C refrigerated SLA).
  - 4-digit cryptographically random OTP verification PIN for courier handover.
  - Direct links to Pharmacist Chat and Emergency SOS escalation hotline.
- **Tax Invoice Modal (`TaxInvoiceModal.tsx`)**:
  - Official GST-compliant medical invoice display with pharmacy drug license numbers (`DL-KA-...`), batch codes, and tax breakdowns.
- **Schedule H1 Compliance Guard (`ScheduleH1Modal.tsx`)**:
  - CDSCO legal warning modal detailing prescription verification requirements under the Indian Drugs and Cosmetics Rules.

### Changed
- Enhanced `CartScreen.tsx` with dynamic promo code validation engine (`FIRSTGENERIC`, `JAN_AUSHADHI_20`).
- Improved cart item unit price display to emphasize per-tablet cost savings.

### Fixed
- Resolved discrepancy where cart subtotal failed to update immediately upon quantity changes.

---

## [0.2.0] - 2025-02-15

### Added
- **Medicine Detail & Bioequivalence Screen (`MedicineDetailScreen.tsx`)**:
  - In-depth Active Pharmaceutical Ingredient (API) specification.
  - Interactive dissolution rate comparison curve between branded and generic formulations.
  - Hyperlocal pharmacy list sorting dispensaries by distance, delivery speed, and strip pricing.
- **Bioequivalence Verification Modal (`BioequivalenceModal.tsx`)**:
  - Monograph compliance audit information (Indian Pharmacopoeia & US Pharmacopeia standards).
- **Interactive Pharmacist Chat Drawer (`ChatPharmacistModal.tsx`)**:
  - Consultation dialog with registered clinical pharmacists for dosage confirmation.

### Changed
- Upgraded project styling to Tailwind CSS v4 using `@tailwindcss/vite` plugin.
- Standardized color system with clinical deep teal palette (`--primary: #005048`).

---

## [0.1.0] - 2025-02-01

### Added
- **Initial Project Scaffold**:
  - Vite 6 + React 19 + TypeScript build pipeline.
  - Mobile-first responsive app shell with top `Header` and persistent `BottomNav`.
  - Comprehensive mock dataset (`src/data/mockData.ts`) featuring popular Indian medicines (Dolo 650, Augmentin 625, Lipitor 20, Glucophage 500, Pantocid 40).
- **Molecule Comparison Engine (`CompareScreen.tsx`)**:
  - Quick salt category filter pills.
  - Side-by-side branded vs. generic price comparisons with calculated rupee and percentage savings.
- **Cart & Mock Checkout (`CartScreen.tsx`)**:
  - Line-item quantity controls, batch identification, and address selection modal.

### Removed
- Removed default Vite starter boilerplate and default styling.
