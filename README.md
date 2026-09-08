# Salon Management System

## Phase 5: Expenses, Categories & Profit & Loss

This phase adds expense tracking and a Profit & Loss view on top of the Phase 4 reports. Expenses are recorded against named categories and feed an **Operating Profit** estimate alongside sales.

### Expense Domain Rules

- Expenses use **integer rupees** like everything else. Non-integer amounts are rounded to the nearest rupee server-side (`Math.round`) — frontend totals are never trusted.
- Every expense has a **category** (owned by the same salon) and a `categoryName` snapshot so the name history stays stable even if a category is later renamed.
- **No permanent deletion.** An expense is *cancelled* (`status: "cancelled"`, with optional reason + timestamp). Cancelled expenses stay in history but are **excluded from all financial totals**. They can be explicitly *reactivated*.
- Payment methods: `cash`, `upi`, `card`, `bank`, `other`. `referenceNumber` (e.g. invoice no.) must be unique per salon among active expenses.
- `expenseDate` is the business date the expense belongs to. It is normalized to **start of day Asia/Kolkata** (`YYYY-MM-DD` + `00:00+05:30`) and all reports match on `expenseDate`, never `createdAt`.

### Operating Profit (Estimated — NOT Accounting Profit)

| Metric | Definition |
|--------|-----------|
| Total Expenses | `SUM(expenses.amount)` where `status === "active"` **and** `expenseDate` in range |
| Operating Profit | **Net Sales − Total Expenses** |

This is a deliberately conservative, explicitly-labeled **operating estimate** — it is not accounting/net income, is not EBITDA, and has no tax treatment. Negative profit is a valid output and is never forced to zero.

**Amount Collected ≠ Net Sales.** Collected is cash received (`SUM(amountPaid)`); Net Sales is billed (`SUM(finalAmount)`). Profit is always derived from Net Sales, never from collected cash.

### Models

**ExpenseCategory** — `salonId`, `name`, `description`, `isActive`. Unique compound index `{ salonId: 1, name: 1 }` (case-insensitive duplicates rejected). Categories are deactivated, never deleted — expenses keep their `categoryName` snapshot.

**Expense** — `salonId`, `category` (ObjectId ref) + `categoryName` snapshot, `title`, `description`, `amount` (int > 0), `expenseDate` (Date), `paymentMethod` (enum), `referenceNumber`, `notes`, `status` (`active`/`cancelled`), `cancelledAt`, `cancelledReason`, `createdBy`, `updatedBy`, timestamps. Indexed for tenant + date + category lookups.

### Expense API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expense-categories` | List with `page`/`limit`/`search`/`isActive`; `?active=true` returns dropdown list |
| POST | `/api/expense-categories` | Create category |
| GET/PATCH | `/api/expense-categories/[id]` | Read / rename / deactivate or reactivate a category |
| GET | `/api/expenses` | List with `search` (title/desc/ref/category), `category`, `paymentMethod`, `status`, `from`/`to`, pagination + active-summary |
| POST | `/api/expenses` | Create expense |
| GET/PATCH | `/api/expenses/[id]` | Read / correct an expense (status is never editable here) |
| POST | `/api/expenses/[id]/cancel` | Cancel with optional `{ reason }` |
| POST | `/api/expenses/[id]/reactivate` | Reactivate a cancelled expense |

All expense endpoints require owner auth, derive `salonId` from the JWT, and reject cross-tenant access (`EXPENSE_NOT_FOUND` / `CATEGORY_NOT_FOUND`).

### Expense & Financial Report Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/expenses` | `totalExpenses`, `expenseCount`, `cancelledCount`, `averageExpense` (active only) |
| GET | `/api/reports/expenses/categories` | Per-category totals + share % |
| GET | `/api/reports/expenses/payments` | Per payment-method totals + share % (normalized to the 5 methods) |
| GET | `/api/reports/expenses/daily` | Continuous daily expense trend (zero-fill) |
| GET | `/api/reports/financial-summary` | Combined `{ sales, expenses, profit: { operatingProfit } }` |
| GET | `/api/reports/financial-trend` | Per-day `{ sales, expenses, operatingProfit }` merged by business date |

Same `range`/`from`/`to` date handling as Phase 4. The dashboard (`/api/reports/dashboard`) now also returns `expenses`, `financial.operatingProfit`, and `topExpenseCategories` from a parallel `Promise.all` (7 queries).

### UI

- **Expenses** (`/expenses`) — list with search, category/payment/dates/status filters, pagination, totaling, and "Manage Categories".
- **New expense** (`/expenses/new`) / **detail** (`/expenses/[id]`) — form with client-side validation (required title/category/amount>0/date), category dropdown + inline category manager, and Cancel (reason required optional) / Reactivate actions instead of Delete.
- **Dashboard** — "Financial Overview" cards: Net Sales, Total Expenses, Operating Profit (green/red for loss), top expense categories.
- **Reports** — Profit & Loss section, expenses by category/payment tables, and a Sales-vs-Expenses daily trend.

### Testing

```bash
npm run test:expenses
```

Integration tests against in-memory MongoDB covering: category CRUD/duplicates/deactivate/reactivate, expense create/update/cancel/reactivate validation, duplicate-reference and cross-salon rejection, listing filters/summary, expense reports (summary, category & payment breakdown, daily zero-fill, top categories), Profit & Loss math (negative and positive profit), period trend, Asia/Kolkata date boundaries, and cross-tenant isolation. Expect `94 passed, 0 failed`. Run `npm run test:reports` (`34 passed`) for Phase 4 regression.

### Performance

All expense reporting is aggregation-only (`$match` on `salonId` + `expenseDate` + `status` first, then `$group`). No expense lists are downloaded into Node for reports. New compound indexes on Expense (`{ salonId, expenseDate }`, `{ salonId, category, expenseDate }`, `{ salonId, status, expenseDate }`) serve the pipelines.

---

## Phase 4: Reports & Financial Analytics

This phase adds business reporting and financial analytics on top of the Phase 1-3 transaction system. All numbers come from real transaction records via MongoDB aggregation — no client-side math, no fake data.

### Report Definitions

| Metric | Definition |
|--------|-----------|
| Gross Sales | `SUM(transactions.subtotal)` — line-item totals before discount |
| Discounts | `SUM(transactions.discount.amount)` |
| Net Sales | `SUM(transactions.finalAmount)` = Gross Sales − Discounts |
| Amount Collected | `SUM(transactions.amountPaid)` — actual cash received |
| Amount Due | `SUM(transactions.amountDue)` — outstanding balance |
| Transactions | Count of eligible transaction records |
| Customers | Count of **unique** `customerId` values with eligible transactions |
| Average Bill | Net Sales ÷ Transactions (`0` when no transactions, never NaN/Infinity) |
| Service Revenue | `SUM(services[].total)` from historical price snapshots inside each transaction (never the current Service price) |
| Payment Revenue | `SUM(amountPaid)` grouped by `paymentMethod` (collection-based) |

**Transaction eligibility**: the schema supports `paymentStatus: ["paid", "partial", "pending"]`. There is **no cancelled status**. Every transaction in the date range is eligible. Revenue reports the billed `finalAmount` (accrual basis); collection reports `amountPaid`. A partial transaction (bill ₹1000, paid ₹500) contributes ₹1000 to sales and ₹500 to collected / ₹500 to due.

**Service revenue note**: discounts are applied at the transaction level, not per service line. Service revenue therefore reflects gross line totals (e.g., two ₹500 Hair Cuts = ₹1000, even if a transaction-level ₹100 discount was applied).

### Report API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/summary` | Gross/discount/net sales, collected, due, txn count, unique customers, avg bill |
| GET | `/api/reports/daily-sales` | Continuous per-day trend (zero-sales days included) |
| GET | `/api/reports/services` | Service-wise revenue/quantity/share from snapshots |
| GET | `/api/reports/payments` | Collected amount per method with share % |
| GET | `/api/reports/dashboard` | Combined dashboard payload (summary, daily, top services, payments, recent) |

**Query params** (all endpoints):
- `range` — `today`, `yesterday`, `this-week`, `this-month`, `last-month`
- `from` + `to` — custom range, `YYYY-MM-DD`, both inclusive; max 366 days

Example: `GET /api/reports/summary?range=this-month` or `GET /api/reports/daily-sales?from=2026-09-01&to=2026-09-08`.

All report endpoints:
- require owner authentication (JWT cookie)
- derive `salonId` **server-side** from the JWT — a client-supplied `salonId` is ignored
- validate dates and return stable error codes (`REPORT_UNAUTHORIZED`, `REPORT_INVALID_DATE`, `REPORT_INVALID_RANGE`, `REPORT_GENERATION_FAILED`, `DASHBOARD_DATA_FAILED`)

### Date / Timezone Strategy

The salon operates in **Asia/Kolkata** (IST, UTC+05:30).

- A "day" is `00:00:00.000 IST` through `23:59:59.999 IST`.
- Queries use an exclusive upper bound: `createdAt >= fromISO && createdAt < toISO` where `fromISO` = start of start-day in IST and `toISO` = start of day **after** the end-day. This avoids end-of-day precision drift.
- Daily grouping uses Mongo's `$dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "Asia/Kolkata" }`, so a transaction at `2026-09-07 23:30 IST` (UTC `18:00`) counts under September 7, and `2026-09-08 00:01 IST` (UTC `18:31` on Sep 7) counts under September 8.
- Server locale/timezone is never trusted. All date math lives in `lib/dates/timezone.js`.

### Aggregation Strategy

Reporting uses MongoDB aggregation pipelines (`$match` → `$unwind`/`$group`/`$sum` → `$sort`). No transaction lists are downloaded into Node.js (except the limited recent-transactions query, capped at 8 rows). All pipelines are TENANT-SCOPED via `$match: { salonId, createdAt: {...} }` as the first stage.

- **Summary**: one `$group` on the whole set with `$addToSet` for unique customers.
- **Services**: `$unwind: "$services"` then `$group` by `serviceId`, summing `quantity` and `total`.
- **Payments**: `$group` by `paymentMethod` summing `amountPaid`, normalized to the four known methods.
- **Daily**: `$group` by IST date string, then filled into a continuous date range with zero rows.

### Performance

- The existing `{ salonId: 1, createdAt: -1 }` index fully serves the `salonId` + `createdAt` match used by every report. **No new indexes were required.**
- Custom ranges are capped at 366 days to bound aggregation input.
- The dashboard endpoint runs its five independent queries with `Promise.all` server-side (one request, no waterfall).
- No caching layer (Redis/materialized views) is introduced — aggregation over indexed transactions is sufficient at salon scale.

### Charts

No chart library was added. Charts are lightweight CSS/SVG horizontal bars with accessible labels and the underlying figures as text — responsive and dependency-free.

### Testing

```bash
npm run test:reports
```

Runs integration tests against an in-memory MongoDB (`mongodb-memory-server`, a devDependency) covering: summary math on the spec's controlled dataset (gross 2000 / discount 100 / net 1900 / collected 1400 / due 500), service snapshot revenue, payment breakdown incl. partials, daily continuity + zero days, the Asia/Kolkata 23:59/00:01 boundary, cross-tenant isolation (Salon B never leaks into Salon A), and NaN/Infinity guards. Expect `34 passed, 0 failed`.

If you have a local MongoDB you can instead run:
```bash
$env:MONGODB_URI="mongodb://127.0.0.1:27017"   # PowerShell
node scripts/test-reports.js
```

---

## Phase 1: Foundation

A production-ready salon management web application built with Next.js, React, MongoDB, and Mongoose.

## Architecture

This project uses a **modular monolith** architecture with clean separation of concerns:

- **UI**: Next.js App Router components (server + client as needed)
- **API**: Route Handlers with consistent response format
- **Business Logic**: Service layer between controllers and models
- **Database**: Mongoose models with proper schemas
- **Authentication**: Secure owner auth with HttpOnly cookies
- **Configuration**: Environment variables with validation

## Folder Structure

```
app/
├── (auth)/          # Authentication routes (App Router groups)
│   └── login/
│       └── page.js
│
├── (dashboard)/    # Dashboard routes
│   ├── dashboard/
│   │   └── page.js
│   │
│   └── settings/
│
├── api/
│   ├── auth/
│   │   ├── login/
│   │   │   └── route.js
│   │   ├── logout/
│   │   │   └── route.js
│   │   └── me/
│   │       └── route.js
│   └── health/
│       └── route.js
│
├── layout.js        # Root layout
├── page.js          # Home page
└── globals.css

components/
├── ui/              # UI components
├── layout/          # Layout components
├── auth/            # Auth components
└── dashboard/       # Dashboard components

models/
├── Salon.js         # Salon business model
└── User.js          # User model with authentication

services/
├── auth/            # Auth business logic
│   └── authService.js
└── salon/           # Salon business logic (Phase 1 placeholder)

lib/
├── db/              # Database connection utility
│   └── mongodb.js
├── auth/            # Auth middleware
│   └── middleware.js
├── errors/          # Error handling
│   ├── AppError.js
│   └── errorHandler.js
├── logger/          # Server-side logging
│   └── logger.js
├── validation/      # Zod schema validation
│   └── index.js
└── utils/           # Utility functions

config/
└── env.js           # Environment variable validation

.validations/
└── auth/            # Zod validation schemas

constants/

middleware.js        # Next.js middleware entry point

.env.example         # Environment variable examples
package.json         # Project dependencies
README.md            # This file
```

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: JavaScript (ES modules)
- **UI**: React + Tailwind CSS
- **Database**: MongoDB with Mongoose
- **Validation**: Zod
- **Password Hashing**: bcryptjs
- **Authentication**: JWT with HttpOnly cookies

## Environment Variables

Create a `.env` file based on `.env.example`:

```
MONGODB_URI=mongodb://localhost:27017/salon
MONGODB_DB_NAME=salon
NODE_ENV=development
NEXT_PUBLIC_APP_NAME="Salon Management System"
SESSION_SECRET=change-this-to-a-secure-random-string-in-production
```

### Required Variables

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection URI (local or Atlas) |
| `MONGODB_DB_NAME` | Database name |
| `SESSION_SECRET` | Secret for signing JWT sessions (min 32 chars) |
| `NODE_ENV` | Environment: development, production, or test |
| `NEXT_PUBLIC_APP_NAME` | Application name (frontend display) |

## MongoDB Setup

### Local Development

1. Install MongoDB Community Edition
2. Start MongoDB service: `mongod --dbpath ./data`
3. The application connects to `mongodb://localhost:27017/salon` by default

### MongoDB Atlas

1. Create a cluster at [mongodb.com/cloud](https://mongodb.com/cloud)
2. Get the connection string
3. Update `MONGODB_URI` in `.env`
4. Whitelist your IP address in Atlas network access

## Authentication

### Login Flow

1. POST `/api/auth/login` with `{ email, password }`
2. Validate request body using Zod schema
3. Find user by email (includes salonId)
4. Check user is active
5. Compare password hash using bcryptjs
6. Create JWT token signed with SESSION_SECRET
7. Set HttpOnly cookie: `session` cookie with `secure`, `sameSite: strict`
8. Return safe user data: `{ id, name, email, role, salonId }`

### Logout Flow

1. POST `/api/auth/logout`
2. Clear the `token` cookie
3. Return success response

### Current User

1. GET `/api/auth/me`
2. Read token from cookies
3. Verify JWT and return safe user information

### Cookie Security

- `httpOnly: true` - Inaccessible to JavaScript (protects against XSS)
- `secure: true` - Sent only over HTTPS (production)
- `sameSite: "strict"` - Prevents CSRF attacks
- `maxAge: 7 days` - Session expiration

## API Conventions

### Success Response

```json
{
  "success": true,
  "data": {}
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "requestId": "req_abc123"
  }
}
```

### HTTP Status Codes

- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate key)
- `422` - Validation Error
- `429` - Rate Limited
- `500` - Internal Server Error

## Error Handling

Centralized error handling via `errorHandler.js` middleware. All errors extend `AppError` class with:

- `message`: Error description
- `statusCode`: HTTP status code
- `errorCode`: Machine-readable error code

## Security Features

- **Input Validation**: Zod schemas on all API routes
- **Password Hashing**: bcryptjs with 12 salt rounds
- **HttpOnly Cookies**: Prevents XSS token theft
- **SameSite Strict**: CSRF protection
- **Tenant Isolation**: All queries scoped to `salonId`
- **Rate Limiting**: Login attempt protection (Phase 1)
- **Safe Error Messages**: No stack traces or secrets exposed to clients
- **No Plain Passwords**: Never returned from APIs, never stored unhashed

## Database Models

### Salon Model

```javascript
{
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  currency: { type: String, default: "INR" },
  timezone: { type: String, default: "Asia/Kolkata" },
  isActive: { type: Boolean, default: true },
  createdAt, updatedAt
}
```

### User Model

```javascript
{
  salonId: { type: ObjectId, required: true },  // tenant boundary
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["owner"], default: "owner" },
  isActive: { type: Boolean, default: true },
  lastLoginAt: { type: Date },
  createdAt, updatedAt
}
```

**Index**: `{ salonId: 1, email: 1 }` (unique composite for tenant isolation + email lookup)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Owner login |
| POST | `/api/auth/logout` | Owner logout |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/health` | Health check |

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Build for production |
| `npm run start` | Start production server |

## Testing Checklist - Phase 1

### MongoDB Connection

- [ ] Application starts without MongoDB connection errors
- [ ] `connect()` utility reuses existing connection in development
- [ ] Useful error messages on connection failure

### User Model

- [ ] Salon model creates records successfully
- [ ] User model creates records with hashed passwords
- [ ] Password comparison works correctly
- [ ] toJSON excludes passwordHash
- [ ] Indexes are created (salonId + email)

### Authentication

- [ ] Login with valid credentials returns user and sets cookie
- ] Login with invalid credentials returns 401 error
- [ ] Login with disabled account returns 401 error
- [ ] Logout clears the cookie
- [ ] GET `/api/auth/me` returns safe user data when authenticated
- [ ] GET `/api/auth/me` returns 401 when not authenticated

### Error Handling

- [ ] Validation errors return 422 with detail messages
- [ ] Duplicate key errors return 409
- [ ] Invalid ObjectId errors return 400
- [ ] JWT errors return appropriate 401 codes
- [ ] Technical details logged, safe messages shown to users
- [ ] Request IDs included in error responses

### API Responses

- [ ] Success responses have `{ success: true, data }` format
- [ ] Error responses have `{ success: false, error: { code, message } }` format
- [ ] Consistent across all endpoints

### Tenant Isolation

- [ ] All user queries include `salonId` scope
- [ ] Cannot access another salon's data by manipulating salonId
- [] salonId derived from authenticated session, not from request

### Security

- [ ] No secrets in source code (all from env vars)
- [ ] Passwords never returned from APIs
- [ ] Cookie flags (httpOnly, secure, sameSite) set correctly
- [ ] Input validation on all API routes

### Frontend

- [ ] Login page renders correctly
- [ ] Login form has normal, loading, error, and success states
- [ ] Login button disabled during request
- [ ] User-friendly error messages displayed
- [ ] Dashboard shell renders with placeholders
- [ ] No "TypeError" messages visible to users

### Health Check

- [ ] GET `/api/health` returns `{ success: true, data: { status: "ok", database: "connected" } }`
- [ ] Returns unhealthy status when database is disconnected

## Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Generate secure `SESSION_SECRET` (32+ characters)
- [ ] Use HTTPS (required for `secure: true` cookies)
- [ ] Set up MongoDB Atlas with proper network access
- [ ] Configure domain and SSL certificate
- [ ] Set up process manager (PM2, Docker, etc.)
- [ ] Monitor error logs regularly

### Environment Configuration

Never commit actual secrets. The `.env` file must never be committed to version control. Only `.env.example` is committed.

## Future Phases

Planned extensions include:

- Expenses and profit accounting
- Staff accounts management and commission analytics
- Appointments and bookings
- Inventory management
- Memberships and loyalty programs
- WhatsApp integration
- Marketing automation
- Multi-branch management
- AI analytics

## License

Proprietary - Real salon deployment. Not for public redistribution.