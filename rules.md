# Project Rules & Guidelines for AI Assistants

This document defines the strict engineering, architectural, and operational rules for **GenericMed**. Any AI coding assistant, developer, or automated tool operating on this repository **must strictly adhere** to these rules.

---

## 1. Golden Rule: Never Break Existing Functionality

> [!CAUTION]
> **PRESERVATION OF WORKING SYSTEM IS PARAMOUNT**
> Never alter, break, or remove existing working features, user flows, mock datasets, or modal dialogs unless the user explicitly commands a refactor or redesign.

1. **Regression Prevention**: Before editing an existing component or state handler, read the entire file and understand all incoming props, events, and side-effects.
2. **Mock Data Integrity**: Maintain the integrity of existing records in `src/data/mockData.ts`. If new fields are needed, add them optional or update all records consistently without deleting existing identifiers (e.g., `comp-1`, `comp-2`, `INITIAL_CART_ITEMS`).
3. **Modal & Navigation Parity**: Do not delete existing modal triggers or screen routing links in `App.tsx` or `BottomNav.tsx`. Every screen tab (`compare`, `medicine-detail`, `cart`, `orders`, `prescriptions`) must remain accessible.
4. **Build Verification**: Run `npm run lint` or `npm run build` after any non-trivial code modifications to guarantee zero compile-time or TypeScript errors.

---

## 2. Coding Standards

### 2.1 TypeScript & Type Safety
- **Strict Mode**: Never use `any` unless wrapping an untyped third-party legacy script. Always define explicit interfaces or type aliases in `src/types.ts`.
- **Shared Types**: All domain models (e.g., `ComparisonPair`, `PharmacyOffer`, `CartItem`, `PrescriptionRecord`, `ScreenTab`) must reside in `src/types.ts`. Do not define duplicate ad-hoc types across multiple files.
- **Props Definition**: Every React component must have a clearly defined TypeScript interface for its props (e.g., `interface HeaderProps { ... }`).
- **Null & Undefined Safety**: Always use optional chaining (`user?.address`) and nullish coalescing (`value ?? defaultValue`) when handling potentially absent data.

### 2.2 React 19 Best Practices
- **Functional Components**: Use standard functional components with React Hooks. Do not write class components.
- **Hook Rules**: Never call hooks conditionally or inside loops. Keep hook logic clean and colocated.
- **State Encapsulation**: Keep state as close as possible to the component using it. Only lift state up to `App.tsx` when multiple screens require shared access (e.g., active cart items, active modal states, notification badges).
- **Clean Event Handlers**: Prefix event handler props with `on` (e.g., `onSelectMolecule`, `onCloseModal`) and local handler functions with `handle` (e.g., `handleAddToCart`, `handleTabChange`).

### 2.3 Styling & Clean Markup
- **Tailwind CSS v4 Utility First**: Utilize standard Tailwind utilities mapped to the design tokens declared in `src/index.css`.
- **Semantic HTML**: Use proper tags (`<header>`, `<main>`, `<section>`, `<article>`, `<nav>`, `<button>`). Avoid nested `<div>` soup when semantic elements are more appropriate.
- **Accessible Buttons**: All interactive clickable elements must be `<button>` tags with accessible text or `aria-label`, never plain `<div>` with `onClick` without keyboard accessibility.

---

## 3. Folder & File Structure Rules

Follow this standardized directory layout:

```text
GenericMed/
├── public/                 # Static public assets (icons, manifests, images)
├── src/
│   ├── components/         # Main screen views & primary layout widgets
│   │   ├── modals/         # All dialog modals, overlays, and drawer components
│   │   ├── BottomNav.tsx   # Persistent mobile bottom navigation bar
│   │   ├── CartScreen.tsx  # Cart, coupon, delivery address & checkout flow
│   │   ├── CompareScreen.tsx # Medicine price comparison search & salt filters
│   │   ├── Header.tsx      # Top bar with location, search, notifications
│   │   ├── MedicineDetailScreen.tsx # Salt composition, pharmacy listings, bioequivalence
│   │   ├── OrderTrackingScreen.tsx  # Live dispatch, cold-chain telemetry, rider OTP
│   │   └── PrescriptionsScreen.tsx  # Digitized prescriptions & OCR scanner
│   ├── data/               # Static fixtures, mock databases, initial states
│   │   └── mockData.ts     # Master mock data fixture
│   ├── types.ts            # Centralized TypeScript interfaces and domain types
│   ├── index.css           # Global Tailwind v4 tokens, font imports, base theme
│   ├── main.tsx            # React root mount entry point
│   └── App.tsx             # Root component, global state, router & modal orchestration
├── .env.example            # Template for environment variables
├── changelog.md            # Chronological project history
├── decisions.md            # Architecture Decision Records (ADR)
├── memory.md               # Long-term system context & domain roadmap
├── rules.md                # This rules and guidelines file
├── package.json            # Project dependencies and script declarations
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite build & plugin configuration
```

### Placement Guidelines:
- Place modal dialogs **strictly** inside `src/components/modals/`.
- Place reusable screen components inside `src/components/`.
- Place persistent data fixtures inside `src/data/`.
- Place shared TypeScript interfaces in `src/types.ts`.

---

## 4. Naming Conventions

| Entity | Convention | Example |
| :--- | :--- | :--- |
| **React Component Files** | `PascalCase.tsx` | `CompareScreen.tsx`, `TaxInvoiceModal.tsx` |
| **Utility / Hook Files** | `camelCase.ts` | `formatCurrency.ts`, `useGeolocation.ts` |
| **Component Names** | `PascalCase` | `export const ScheduleH1Modal: React.FC` |
| **Types & Interfaces** | `PascalCase` | `ComparisonPair`, `PharmacyOffer` |
| **State Variables** | `camelCase` | `currentTab`, `isBioModalOpen` |
| **Event Handlers** | `handle[Action]` | `handleSelectMolecule`, `handleAddToCart` |
| **Handler Props** | `on[Action]` | `onClose`, `onSelectTab` |
| **Constants** | `UPPER_SNAKE_CASE` | `HOTLINK_IMAGES`, `INITIAL_CART_ITEMS` |
| **CSS Variables / Design Tokens** | `kebab-case` | `--primary`, `--surface-card`, `--border-subtle` |

---

## 5. UI/UX Consistency Rules

1. **Color Token Palette**:
   - **Primary Brand**: Deep Clinical Teal (`#005048`, `--primary`) representing pharmacy trust.
   - **Primary Container**: Vibrant Teal (`#006a60`, `--primary-container`).
   - **Canvas Background**: Soft cool white/slate (`#f8f9ff`, `--surface`).
   - **Card Background**: Clean white (`#FFFFFF`, `--surface-card`).
   - **Borders**: Subtle slate border (`#E2E8F0`, `--border-subtle`).
   - **Alerts**: Use defined status tokens:
     - Success: `#ECFDF5` / `#065F46`
     - Warning: `#FFFBEB` / `#92400E`
     - Danger: `#FEF2F2` / `#991B1B`
     - Info: `#F0FDFA` / `#115E59`

2. **Typography**:
   - Primary Font: `Inter`, system sans-serif fallback.
   - Tabular / Monospace: `JetBrains Mono` for batch numbers, GSTIN, and price tables.
   - Hierarchy:
     - Headings: `font-bold text-text-primary`
     - Subheadings / Captions: `text-text-muted text-xs` or `text-sm`
     - Badges: `font-semibold text-[11px] px-2 py-0.5 rounded-full`

3. **Iconography**:
   - Use Google **Material Symbols Outlined** (`<span className="material-symbols-outlined">icon_name</span>`) or **Lucide React** icons.
   - Always ensure icon sizes match text proportions (e.g., `text-[18px]` or `text-[20px]`).

4. **Micro-Interactions & Responsiveness**:
   - Mobile-First design: Must render cleanly on mobile viewports (360px–480px width) as well as tablets and desktops (`max-w-md` or `max-w-lg` centered wrapper for mobile app emulation, or responsive grid for desktop).
   - Touch targets: Minimum 44px × 44px for buttons and interactive controls.
   - Active states: Use `hover:bg-...`, `active:scale-98`, and smooth transitions (`transition-all duration-200`).

---

## 6. Git Commit Rules

GenericMed follows the **Conventional Commits** specification:

```text
<type>(<optional scope>): <short imperative description>

[optional body]

[optional footer(s)]
```

### Allowed Types:
- `feat`: A new user-facing feature (e.g., `feat(cart): add instant UPI QR payment flow`)
- `fix`: A bug fix (e.g., `fix(compare): correct normalized per-tablet savings calculation`)
- `refactor`: Code change that neither fixes a bug nor adds a feature (e.g., `refactor(modals): extract shared modal backdrop`)
- `style`: Changes that do not affect code logic (formatting, spacing)
- `docs`: Documentation updates (e.g., `docs(adr): document cold-chain SLA decision`)
- `chore`: Maintenance tasks, dependency updates, configuration adjustments
- `perf`: Code changes that improve performance

### Commit Message Guidelines:
- Write in the imperative, present tense ("add", not "added" or "adds").
- Do not end the subject line with a period.
- Keep the commit message concise (72 characters max for title).

---

## 7. Security & Environment Variable Rules

1. **Environment Variables**:
   - **Never hardcode secrets**: API keys, database credentials, or secret tokens must never be committed to source control.
   - Reference all secrets through environment variables (e.g., `process.env.GEMINI_API_KEY` or `import.meta.env.VITE_...`).
   - Always keep `.env.example` updated with mock/placeholder keys whenever a new environment variable is introduced.
   - Ensure `.env` is listed in `.gitignore`.

2. **Client vs. Server Safety**:
   - Sensitive medical API calls, CDSCO registry queries, or AI generation prompts requiring private keys must be gated via server-side endpoints (Express / Cloud Functions) rather than exposed directly in browser client bundles.
   - The `metadata.json` lists `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API` for secure Gemini API delegation.

3. **Medical Data Privacy & CDSCO Protection**:
   - Prescriptions uploaded by users contain Protected Health Information (PHI). Do not log prescription images or patient medical histories to public loggers.
   - User addresses and phone numbers must be sanitized before rendering in mock logs.
   - All prescription uploads must simulate encryption at rest (AES-256) and HTTPS in transit.

---

## 8. Development Commands Checklist

Before pushing changes or completing a task, execute these verification commands:

| Command | Purpose | Expected Result |
| :--- | :--- | :--- |
| `npm run lint` | Runs `tsc --noEmit` | Clean zero-error output |
| `npm run build` | Builds production bundle via Vite | Successful build into `dist/` |
| `npm run dev` | Starts local development server | Serves app on `http://localhost:3000` |
