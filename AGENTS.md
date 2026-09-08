# AGENTS.md — Salon Management System (MVP)

## Quick Start

```bash
npm install        # Install dependencies
npm run dev        # Start dev server (Next.js + Turbopack)
npm run build      # Production build
npm run lint       # Lint (next lint)
```

## Architecture

**Next.js App Router** (JS, no TypeScript) with server-side API routes under `app/api/`.

- `app/(dashboard)/` — Frontend pages (client components with `"use client"`)
  - `dashboard/` — Sales dashboard with date range filters
  - `services/` — Service CRUD (modal-based add/edit, card grid)
  - `transactions/` — Transaction list (simple row format, search + payment filter)
  - `transactions/new/` — Create new transaction (card-based service selector)
  - `transactions/[id]/` — Transaction detail/receipt
- `app/api/` — Backend API routes (export named `GET`, `POST`, `PATCH`, `DELETE`)
- `services/` — Business logic layer (called by API routes)
  - `auth/authService.js` — Login, register, logout, me
  - `service/serviceService.js` — Service CRUD with image upload
  - `transactions/transactionService.js` — Transaction CRUD, number generation
- `models/` — Mongoose schemas (Counter, Salon, Service, Transaction, User)
- `lib/` — Shared utilities
  - `auth.js` — Shared auth helpers (parseCookies, verifyAuth, unauthorizedResponse, connectDB)
  - `calculations/transaction.js` — Transaction validation and calculation
  - `dates/timezone.js` — IST date helpers (resolveDateRange, getToday, etc.)
  - `db/mongodb.js` — Cached Mongoose connection
  - `errors/AppError.js` — Custom error class
  - `format/` — Response formatting
- `config/env.js` — Environment config (lazy-loaded Zod schema)
- `validations/` — Zod schemas (auth, serviceCreate, transactionCreate)
- `components/` — UI components
  - `ui/` — Modal, Toast, ConfirmDialog
  - `services/` — ServiceCard, ServiceForm, EmptyState, SkeletonCard
  - `transactions/` — TransactionCard, TransactionSkeleton
  - `dashboard/` — DashboardContent, SummaryCard
  - `charts/` — SimpleBarChart
  - `AppNav.js` — Side navigation
  - `AppNavWrapper.js` — Route-aware nav wrapper
  - `AuthGuard.js` — Client-side auth gate

## Critical Conventions

### API Routes — NOT Express

The root `api/` directory contains **stale Express Router files** that are never loaded by Next.js. **All working API routes live under `app/api/`** and export Next.js route handlers:

```js
export async function GET(request) { ... }
export async function POST(request) { ... }
```

### Authentication

Every API route uses shared auth from `lib/auth.js`:

```js
const { connectDB, verifyAuth, unauthorizedResponse } = require("../../../lib/auth")

export async function GET(request) {
  await connectDB()
  const payload = verifyAuth(request)
  if (!payload) return unauthorizedResponse()
  // payload.salonId, payload.userId, payload.role
}
```

The cookie name is `token` (not `session`). JWT payload contains `{ salonId, userId, role }`.

### Config Env — Lazy Loading

`config/env.js` uses a getter with lazy parsing — **never destructure `{ env }` at module top level** or the build fails. Always access inside function bodies:

```js
// BAD — breaks at build time
const { env } = require("../../../config/env")

// GOOD — lazy, only parses on first access
const { env } = require("../../../config/env")  // inside function body
```

### Require Paths

Relative paths from `app/api/` route files to project root:
- Level 1 (`app/api/X/route.js`): `../../../` reaches root
- Level 2 (`app/api/X/Y/route.js`): `../../../../` reaches root

Services/lib use paths relative to their own location (e.g. `../../models/Transaction`).

Frontend pages under `app/(dashboard)/` need 3 levels to reach `components/`:
- `app/(dashboard)/X/page.js`: `../../../components/...`

### Money

All monetary values are **integer rupees** (₹499 = `499`, not paise). Server recalculates all amounts — never trust frontend totals. Rounding: `Math.floor` for percentage discounts.

### Tenant Isolation

Every query must include `salonId` from the authenticated JWT payload. Never query without it. `salonId` is derived server-side, never from client request body.

### Timezone

All dates operate in **Asia/Kolkata** (IST, UTC+05:30). Use `lib/dates/timezone.js` — never trust server locale. Date queries use exclusive upper bound: `>= startOfDay && < startOfNextDay`.

### Error Format

```json
{ "success": false, "error": { "code": "ERROR_CODE", "message": "User-friendly" } }
```

### Mongoose Models

All model files use the hot-reload-safe pattern:

```js
module.exports = mongoose.models.ModelName || mongoose.model("ModelName", schema)
```

## Models

| Model | Key Fields | Tenant Isolation |
|-------|-----------|-----------------|
| Transaction | salonId, transactionNumber, services[], subtotal, discount, finalAmount, paymentMethod, paymentStatus, amountPaid, amountDue, createdBy | salonId+createdAt, salonId+transactionNumber indexes |
| Service | salonId, name, category, price, image, isActive | salonId+isActive, salonId+category indexes |
| Counter | _id (string format `txn_{salonId}_{YYYYMMDD}`), seq | Transaction number generation |
| Salon | name, phone, address, currency, timezone, isActive | name index |
| User | salonId, name, email, passwordHash, role ("owner"), isActive | unique {salonId, email} |

## Transaction Number Strategy

`TXN-YYYYMMDD-NNNN` with atomic counter per salon per day via `models/Counter.js` using `findOneAndUpdate` with `$inc: {seq: 1}` and `upsert: true`.

## Calculation Rules

- `subtotal = Σ(price × quantity)` (server-calculated from DB service prices)
- Discount: `fixed` (value ≤ subtotal) or `percentage` (value ≤ 100%)
- Rounding: `Math.floor(subtotal × percentage / 100)`
- `finalAmount = max(0, subtotal - discount.amount)`
- `amountDue = finalAmount - amountPaid`
- Payment status derived from amounts, not trusted from frontend
- Default when no discount: `{ type: "fixed", value: 0, amount: 0 }`
- Default payment: "paid" in full if not specified

## Dashboard

Sales dashboard with date range filters (Today, Yesterday, This Week, This Month, Last Month). Uses `resolveDateRange()` from `lib/dates/timezone.js` to convert named ranges to IST date boundaries for MongoDB queries.

API: `GET /api/reports/dashboard?range=today` — returns summary, dailySales, topServices, payments, recentTransactions.

## Known Issues

- Root `api/` directory has stale Express Router files — inert, ignored by Next.js
- `config/env.js` Zod validation requires env vars — dev server won't start without `.env`
- Template literals in `RegExp()` break Turbopack — use string concatenation instead
- `.env.example` contains what appears to be a real MongoDB Atlas connection string — treat as placeholder only
