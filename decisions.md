# Architectural & Product Decision Records (ADR)

This document tracks all critical technical, architectural, and product decisions made for **GenericMed**. Every new major architectural decision, technology selection, or product pivot must be appended here following the standard ADR format.

---

## ADR Template

When documenting a new decision, copy this template:

```markdown
### ADR-XXX: [Decision Title]

- **Date**: YYYY-MM-DD
- **Status**: [Proposed | Accepted | Superseded | Deprecated]
- **Context & Problem Statement**: What was the background, business requirement, or architectural problem?
- **Decision Taken**: What specific architecture, library, algorithm, or workflow was chosen?
- **Reasoning**: Why was this solution preferred over others? What criteria were evaluated?
- **Alternatives Considered**: What other options were investigated, and why were they rejected?
- **Impact on Project**:
  - Positive consequences (benefits, performance, compliance)
  - Negative consequences / trade-offs (complexity, maintenance burden)
  - Follow-up work required
```

---

## Decision Log

### ADR-001: Molecule & Salt-Level Bioequivalence Mapping over Direct Brand Mirroring

- **Date**: 2025-01-15
- **Status**: Accepted
- **Context & Problem Statement**:
  In the Indian pharmaceutical market, branded medicines (e.g., Dolo 650, Augmentin, Lipitor) carry price markups of 50%–85% over unbranded or generic equivalents. Many search engines attempt a naive brand-to-brand string search, leading to clinical inaccuracies, mismatched dosages, or failure to locate legally bioequivalent substitutes under CDSCO (Central Drugs Standard Control Organisation) standards.
- **Decision Taken**:
  Establish an active salt/formula identifier (e.g., `PARA-650-IP`, `AMOX-CLAV-625`, `ATOR-20-IP`) as the primary database relation. Every medicine (branded or generic) must map to an audited Active Pharmaceutical Ingredient (API) composition, strength, and delivery mechanism (e.g., Sustained Release, Dispersible) before comparison.
- **Reasoning**:
  - Clinically safe: Prevents substitution errors across different salts or release forms.
  - Aligns directly with Jan Aushadhi and Indian Pharmacopoeia (IP/BP/USP) bioavailability guidelines.
  - Allows N-to-N comparisons between multiple branded variants and verified generic alternatives.
- **Alternatives Considered**:
  - *Direct 1:1 Brand Lookup Table*: Simple to implement, but unmaintainable with over 100,000 SKUs and fragile to spelling differences.
  - *Unsupervised Vector Embedding Search*: High hallucination risk for clinical medicine matching; rejected due to strict medical safety concerns.
- **Impact on Project**:
  - Data model requires explicit formula and active salt entities.
  - High consumer trust through "100% Bio-identical Molecule" badges and lab verification tags.

---

### ADR-002: Unit-Level Cost Normalization (Per Tablet / Per ml vs. Pack Price)

- **Date**: 2025-01-20
- **Status**: Accepted
- **Context & Problem Statement**:
  Pharmaceutical manufacturers package medicines in varying strip counts (e.g., 10 tabs, 15 tabs, 20 tabs, or 30 ml vs 60 ml bottles). Comparing MRP directly misleadingly distorts user perception of true savings (e.g., a 15-tablet pack at ₹34.50 might appear more expensive than a 10-tablet pack at ₹28.00, despite having a cheaper per-tablet cost).
- **Decision Taken**:
  Implement a mandatory unit-cost normalization engine across all comparison views, cart calculations, and search cards. Every price display must compute and render the normalized cost (`Price ÷ Quantity` = ₹X.XX / tablet or ml) alongside the package price.
- **Reasoning**:
  - Gives complete financial transparency to users.
  - Eliminates packaging arbitrage used by brand marketers.
  - Standardizes savings percentages across non-identical packaging configurations.
- **Alternatives Considered**:
  - *Showing only total pack price*: Causes customer confusion and inaccurate savings calculations.
  - *Requiring identical pack sizes only*: Discards over 40% of viable generic substitutes due to different strip configurations.
- **Impact on Project**:
  - Schema requires `tabletsPerStrip` or `packQuantity` attributes on all pharmacy inventory items.
  - Comparison algorithms calculate `savingsRupees` and `savingsPercent` normalized to unit volume.

---

### ADR-003: Multi-Tenant Hyperlocal Dispensary Fulfillment Model

- **Date**: 2025-01-28
- **Status**: Accepted
- **Context & Problem Statement**:
  Centralized warehouse fulfillment for generic drugs suffers from 2–4 day delivery lags, high logistics overhead, and inability to handle cold-chain requirements for acute prescriptions (e.g., antibiotics, insulin). Users needing acute relief will abandon the platform for physical neighborhood stores.
- **Decision Taken**:
  Aggregate local licensed dispensaries (Jan Aushadhi Kendras, Apollo Pharmacy, MedPlus, Wellness Forever, Frank Ross) in a hyperlocal radius (0–5 km). Dispatch orders directly from the nearest verified retailer with real-time stock availability, distance calculation, and 15–45 minute delivery SLAs.
- **Reasoning**:
  - Enables sub-45-minute delivery for urgent treatments.
  - Leverages existing retail inventory without capital-intensive central inventory warehousing.
  - Supports local brick-and-mortar pharmacy compliance (physical batch inspection, pharmacist sign-off).
- **Alternatives Considered**:
  - *Centralized Warehouse-Only Model*: High warehouse CAPEX, slow turnaround, unsuitable for acute medicine.
  - *Pure Marketplace (No Inventory Check)*: High order cancellation rate due to out-of-stock items at third-party pharmacies.
- **Impact on Project**:
  - Requires pharmacy geolocation distance algorithms (`distanceKm`), pharmacy license display (`DL-KA-...`), and live inventory sync.
  - Allows customers to select preferred dispensary based on price, rating, or delivery speed.

---

### ADR-004: Frontend Architecture & Technology Stack (Vite + React 19 + TypeScript)

- **Date**: 2025-02-05
- **Status**: Accepted
- **Context & Problem Statement**:
  The application needs instant interactive responsiveness for molecule comparisons, real-time dosage calculations, modal dialogs (Schedule H1 warnings, OCR, invoices), and seamless mobile-first PWA operation in resource-constrained cellular environments.
- **Decision Taken**:
  Build the client using React 19, TypeScript (~5.8), Vite 6, and Tailwind CSS v4. Utilize modular UI separation with standalone screen components, centralized mock data fixtures, and Material Symbols for lightweight vector iconography.
- **Reasoning**:
  - Vite ensures near-instant HMR and ultra-fast builds.
  - React 19 provides state transitions, optimized rendering, and robust component architecture.
  - Strict TypeScript ensures safety across critical medical dosage numbers and price calculations.
  - Zero heavy external UI frameworks: Native Tailwind CSS tokens ensure maximum visual customization and minimal bundle footprint.
- **Alternatives Considered**:
  - *Next.js App Router*: Added unnecessary server runtime overhead for the current client-focused SPA prototype and AI Studio container deployment.
  - *Pure HTML/Vanilla JS*: Difficult to maintain complex state transitions (cart, multiple interactive modals, tab routing).
- **Impact on Project**:
  - Fast bundle loading with high performance.
  - Clear separation of concerns between screens (`CompareScreen`, `MedicineDetailScreen`, `CartScreen`, `OrderTrackingScreen`, `PrescriptionsScreen`) and modal overlays.

---

### ADR-005: CDSCO & Schedule H / H1 Regulatory Compliance Architecture

- **Date**: 2025-02-14
- **Status**: Accepted
- **Context & Problem Statement**:
  Under the Indian Drugs and Cosmetics Act, Schedule H and Schedule H1 drugs (e.g., Alprazolam, Cefixime, Tramadol, Zolpidem) legally require:
  1. A valid, dated prescription from a Registered Medical Practitioner (RMP).
  2. Mandatory logging of the prescribing doctor, patient name, dispenser registration, and batch details in a Schedule H1 Register retained for minimum 3 years.
- **Decision Taken**:
  Implement a programmatic prescription verification gate:
  - Any cart containing Schedule H/H1 items is locked against checkout until a prescription is attached and verified.
  - Display unambiguous warning banners and a dedicated `ScheduleH1Modal` detailing legal compliance requirements.
  - Preserve immutable batch records, doctor name, and pharmacy license numbers on generated tax invoices.
- **Reasoning**:
  - Strict legal requirement in India; prevents regulatory shutdown and criminal liability.
  - Builds high medical credibility with doctors and regulatory bodies.
- **Alternatives Considered**:
  - *Post-order prescription collection via phone*: High operational friction and compliance vulnerability.
  - *Excluding Schedule H1 drugs entirely*: Limits platform catalog and eliminates crucial antibiotic generic savings.
- **Impact on Project**:
  - Added `ScheduleH1Modal`, `UploadPrescriptionModal`, and `PrescriptionRecord` validation logic.
  - Tax invoice generation includes verified Doctor name, Clinic, and Registered Pharmacist ID.

---

### ADR-006: Dual Cold-Chain SLA & OTP Handover Protocol

- **Date**: 2025-02-22
- **Status**: Accepted
- **Context & Problem Statement**:
  Temperature-sensitive generics (e.g., Insulin, biologicals, probiotics, certain eye drops) degrade if exposed to temperatures outside 2°C–8°C or 18°C–24°C during last-mile delivery, especially during Indian summers. Delivering spoiled medicines is dangerous.
- **Decision Taken**:
  1. Integrate cold-chain telemetry tracking inside the order tracking pipeline (simulating carrier sensor readings, e.g., "Insulated Cooler 4.8°C").
  2. Mandate a 4-digit OTP handover protocol between customer and courier to verify physical seal integrity prior to order completion.
- **Reasoning**:
  - Ensures drug efficacy and patient safety.
  - Eliminates false delivery disputes via cryptographic OTP exchange.
- **Alternatives Considered**:
  - *Standard uninsulated courier pouches*: High risk of spoilage and product liability.
  - *Signature upon delivery*: Ineffective verification compared to 4-digit OTP code verification.
- **Impact on Project**:
  - `OrderTrackingScreen` visualizes real-time carrier telemetry, dispatch logs, and OTP verification card.

---

### ADR-007: Tailwind CSS v4 Design Token System with Semantic CSS Variables

- **Date**: 2025-03-01
- **Status**: Accepted
- **Context & Problem Statement**:
  Healthcare applications require clean, authoritative, accessible visual styling (high contrast, trust-inducing emerald/teal palettes, clear alert states for contraindications and savings). Hardcoding hex colors leads to visual inconsistency.
- **Decision Taken**:
  Define a semantic design token system in `src/index.css` leveraging CSS custom properties mapped to Tailwind CSS v4 variables:
  - `--primary: #005048` (Clinical Deep Teal)
  - `--brand-deep: #0B4F48`
  - `--secondary: #006b5a`
  - `--surface: #f8f9ff`
  - Strict status tokens (`--status-success-*`, `--status-warning-*`, `--status-danger-*`, `--status-info-*`).
- **Reasoning**:
  - Guarantees visual harmony across screens, cards, modals, and badges.
  - Enables instant theme adjustment or dark mode extensibility in a single configuration file.
- **Alternatives Considered**:
  - *Ad-hoc Tailwind utility classes (e.g. `bg-[#005048]` directly in components)*: Causes palette drift, hard to maintain.
  - *Heavy UI component library (e.g. MUI, Chakra)*: Significant bundle bloat and harder to customize for mobile viewport ergonomics.
- **Impact on Project**:
  - All UI elements use semantic CSS tokens (`bg-primary`, `text-text-primary`, `border-border-subtle`).

---

### ADR-008: Decoupled Frontend and Backend Architecture in Dedicated Subfolders

- **Date**: 2026-09-09
- **Status**: Accepted
- **Context & Problem Statement**:
  As the platform matured across Phase 1 to Phase 5, the monolithic directory structure mixed Vite client components, Express API routes, Prisma schemas, and Docker configs in the root. This introduced dependency coupling, risks of accidental backend leakage into frontend bundles, and hindered independent CI/CD pipelines.
- **Decision Taken**:
  Refactor the workspace into two completely decoupled subfolders: `frontend/` (React 19 + Vite + Tailwind v4) and `backend/` (Express 4 + Prisma + Gemini AI), each with its own `package.json`, `tsconfig.json`, and `.env` configuration. Communication occurs exclusively over HTTP REST API calls via Vite reverse proxy in development and Express static serving in production.
- **Reasoning**:
  - Independent dependency versioning and lightweight deployment images.
  - Zero cross-directory relative imports prevents bundle pollution.
  - Flexibility to deploy frontend to CDNs/Edge (Cloudflare, Vercel) and backend to containerized clusters (AWS ECS, Kubernetes).
- **Alternatives Considered**:
  - *Full separate Git repositories*: Overhead in local synchronization for pair development during initial product phases.
  - *Lerna / Nx heavy monorepo tooling*: Unnecessary tooling complexity for a straightforward two-tier web platform.
- **Impact on Project**:
  - Clean separation of concerns with root convenience scripts (`install:all`, `dev:frontend`, `dev:backend`).
  - Both layers can be run, built, and tested independently or together.
