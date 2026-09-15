# Salon Management System

A salon management web application built with Next.js App Router, MongoDB, and Mongoose. Designed for single-salon owners to manage services, track transactions, and view sales dashboards.

Deploy Link : https://lookfamilysalon.vercel.app


## Overview

This application allows salon owners to:
- Register a salon and create an owner account
- Manage salon services (add, edit, delete, with optional images)
- Create transactions by selecting services, applying discounts, and recording payments
- View a sales dashboard with date range filtering, daily trends, top services, payment breakdowns, and recent transactions

The application operates in **Indian Rupees (INR)** using **integer values** (e.g., ₹499 = `499`, not paise). All dates are handled in **Asia/Kolkata (IST, UTC+05:30)** timezone.

## Current Features

| Feature | Status |
|---------|--------|
| Salon registration | Implemented |
| Owner login/logout | Implemented |
| Service CRUD (with images) | Implemented |
| Transaction creation | Implemented |
| Transaction list with search/filter | Implemented |
| Transaction detail/receipt view | Implemented |
| Sales dashboard with date ranges | Implemented |
| Daily sales trend chart | Implemented |
| Top services breakdown | Implemented |
| Payment method breakdown | Implemented |
| Print receipt | Implemented |
| Responsive navigation | Implemented |

### Not Implemented

- Expense tracking (Phase 5 as described in old README)
- Financial P&L reporting (Phase 4 as described in old README)
- Profile/settings page
- Customer management
- Staff accounts
- Appointments/bookings
- Any automated tests (test scripts referenced in old README do not exist)

## Application Flow

```
Register Salon → Login → Dashboard
                          ↓
                    Services (manage)
                          ↓
                    New Transaction (select services → apply discount → choose payment → complete)
                          ↓
                    Transaction List / Detail / Print Receipt
```

1. **Register**: Owner creates a salon (name, phone, address) and their account (name, email, password)
2. **Login**: Owner logs in with email/password, receives JWT in HttpOnly cookie
3. **Dashboard**: View sales summary (total sales, collected, due, discounts), daily trend, top services, payment breakdown, recent transactions
4. **Services**: Add/edit/delete salon services with name, category, price, and optional image
5. **Transactions**: Create new transaction by selecting services, applying optional discount, choosing payment method; view list with search/filter; view detailed receipt

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js (latest) with App Router |
| Language | JavaScript (ES modules, no TypeScript) |
| UI | React + Tailwind CSS v4 |
| Database | MongoDB |
| ORM | Mongoose 8.x |
| Authentication | JWT (jsonwebtoken) + HttpOnly cookies |
| Password Hashing | bcryptjs (12 salt rounds) |
| Validation | Zod 3.x |
| Styling | Tailwind CSS v4 via `@tailwindcss/postcss` |

## Project Structure

```
salon/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth pages (no shared layout)
│   │   ├── login/page.js         # Login form (client component)
│   │   └── register/page.js      # Registration form (client component)
│   ├── (dashboard)/              # Dashboard pages (protected)
│   │   ├── layout.js             # AuthGuard + AppNavWrapper
│   │   ├── dashboard/page.js     # Sales dashboard (server component)
│   │   ├── services/
│   │   │   ├── page.js           # Services list (server component)
│   │   │   ├── add/page.js       # Add service (client component)
│   │   │   └── [id]/page.js      # Service detail/edit (client component)
│   │   └── transactions/
│   │       ├── page.js           # Transaction list (server component)
│   │       ├── new/page.js       # New transaction (server loads services)
│   │       └── [id]/page.js      # Transaction detail/receipt (server component)
│   ├── api/                      # API route handlers
│   │   ├── auth/                 # Login, register, logout, me
│   │   ├── health/               # Health check
│   │   ├── services/             # Service CRUD
│   │   ├── transactions/         # Transaction CRUD
│   │   └── reports/dashboard/    # Dashboard aggregation
│   ├── globals.css               # Tailwind v4 import + theme
│   ├── layout.js                 # Root layout
│   └── page.js                   # Home/landing page
├── components/                   # React UI components
│   ├── charts/                   # SimpleBarChart (CSS/SVG)
│   ├── dashboard/                # DashboardContent, SummaryCard
│   ├── services/                 # ServiceCard, ServiceForm, ServicesManager, EmptyState, SkeletonCard
│   ├── transactions/             # TransactionCard, TransactionForm, TransactionsManager, TransactionSkeleton
│   ├── ui/                       # Modal, Toast, ConfirmDialog
│   ├── AppNav.js                 # Top navigation bar
│   ├── AppNavWrapper.js          # Route-aware nav wrapper
│   └── AuthGuard.js              # Client-side auth gate
├── config/
│   └── env.js                    # Zod-validated environment config (lazy-loaded)
├── lib/                          # Shared utilities
│   ├── auth.js                   # Cookie parsing, JWT verify, auth helpers
│   ├── auth-server.js            # Server-side auth (next/headers)
│   ├── calculations/transaction.js  # Transaction math (subtotal, discount, payment)
│   ├── dates/timezone.js         # IST date helpers
│   ├── db/mongodb.js             # Cached Mongoose connection
│   ├── errors/AppError.js        # Custom error class
│   └── format/index.js           # Currency/number/date formatting
├── models/                       # Mongoose schemas
│   ├── Counter.js                # Atomic transaction number sequence
│   ├── Salon.js                  # Salon business entity
│   ├── Service.js                # Salon services
│   ├── Transaction.js            # Transaction records
│   └── User.js                   # Owner accounts
├── scripts/
│   └── seed-services.js          # Seed sample services (hardcoded salon ID)
├── services/                     # Business logic layer
│   ├── auth/authService.js       # Login, register, logout
│   ├── service/serviceService.js # Service CRUD + image processing
│   └── transactions/transactionService.js  # Transaction CRUD + number generation
├── validations/                  # Zod schemas
│   ├── auth.js                   # loginSchema, registerSchema
│   ├── serviceCreate.js          # serviceCreateSchema, serviceUpdateSchema
│   └── transactionCreate.js      # transactionCreateSchema, transactionQuerySchema
├── .env.example                  # Environment variable template
├── middleware.js                  # Next.js middleware — JWT auth for protected page routes
├── package.json
└── postcss.config.mjs            # Tailwind CSS v4 PostCSS config
```

## Architecture

### Rendering Strategy

The application uses a **hybrid rendering** approach:

| Page | Rendering | Reason |
|------|-----------|--------|
| Login, Register | Client-side (CSR) | Interactive forms with real-time validation |
| Dashboard | Server Component + Client hydration | Server fetches initial data via MongoDB aggregation; `DashboardContent` handles range switching client-side |
| Services list | Server Component + Client hydration | Server loads services; `ServicesManager` handles CRUD operations client-side |
| Service add/edit | Client-side (CSR) | Interactive form with image upload preview |
| Transactions list | Server Component + Client hydration | Server loads initial transactions; `TransactionsManager` handles pagination/filtering client-side |
| New transaction | Server Component + Client hydration | Server loads services list; `TransactionForm` handles selection and submission client-side |
| Transaction detail | Server Component | Fully server-rendered, print-ready receipt |

**Why hybrid?** Server components reduce client-side JavaScript and enable direct MongoDB queries. Client components handle interactivity (forms, modals, filtering). The middleware provides the first layer of auth protection at the edge; `AuthGuard` provides a client-side fallback; Server Components provide defense-in-depth.

### Data Flow

1. **Middleware** intercepts the request, verifies JWT from cookie, and injects user identity headers (`x-user-id`, `x-salon-id`, `x-user-role`) for downstream use
2. **Server Components** read cookies directly via `next/headers`, verify JWT, query MongoDB, and pass serialized data to client components as props
3. **Client Components** receive initial data as props, then fetch updates via API routes
4. **API Routes** (`app/api/`) handle all write operations and client-triggered reads, using shared auth helpers from `lib/auth.js`
5. **Services Layer** contains business logic between API routes and Mongoose models
6. **Calculations** are always server-side — the client never computes final amounts for storage

### State Management

No external state management library. State is managed via:
- React `useState`/`useEffect` in client components
- Server component props for initial data
- URL search params for dashboard date range
- `visibilitychange` event listener to refresh data when tab becomes visible

## Database

### Models

```
Salon
  ├── User (salonId → Salon._id)
  └── Service (salonId → Salon._id)

Transaction (salonId → Salon._id, createdBy → User._id)
  └── services[] (serviceId → Service._id)  [embedded, snapshot]

Counter (standalone, _id = "txn_{salonId}_{YYYYMMDD}")
```

### Key Models

**Salon** — Business entity
| Field | Type | Notes |
|-------|------|-------|
| name | String | Required, max 100 chars |
| phone | String | Required |
| address | String | Required |
| currency | String | Default: `"INR"` |
| timezone | String | Default: `"Asia/Kolkata"` |
| isActive | Boolean | Default: `true` |

**User** — Salon owner
| Field | Type | Notes |
|-------|------|-------|
| salonId | ObjectId | Ref: Salon, required |
| name | String | Required |
| email | String | Required, unique per salon |
| passwordHash | String | bcrypt hashed (12 rounds), excluded from JSON |
| role | String | Enum: `["owner"]`, default: `"owner"` |
| isActive | Boolean | Default: `true` |

- Index: `{ salonId: 1, email: 1 }` (unique composite)
- Pre-save hook: hashes `passwordHash` via bcryptjs
- `toJSON`: excludes `passwordHash`, returns `{ id, salonId, name, email, role }`

**Service** — Salon service
| Field | Type | Notes |
|-------|------|-------|
| salonId | ObjectId | Ref: Salon, required |
| name | String | Required, max 100 chars |
| category | String | Free-text, default: `""` |
| price | Number | Integer rupees, min 0 |
| image | String | Base64 data URL or null |

- Index: `{ salonId: 1, category: 1 }`
- Duplicate name check per salon (case-insensitive)

**Transaction** — Sales record
| Field | Type | Notes |
|-------|------|-------|
| salonId | ObjectId | Ref: Salon, required |
| transactionNumber | String | Unique per salon, format: `TXN-YYYYMMDD-NNNN` |
| services | Array | Embedded: serviceId, serviceName, price, quantity, total |
| subtotal | Number | Sum of line totals |
| discount | Object | `{ type, value, amount }` — fixed or percentage |
| finalAmount | Number | `subtotal - discount.amount` |
| paymentMethod | String | Enum: `cash`, `upi`, `card`, `other` |
| paymentStatus | String | Enum: `paid`, `partial`, `pending` |
| amountPaid | Number | Server-calculated |
| amountDue | Number | Server-calculated |
| notes | String | Optional |
| createdBy | ObjectId | Ref: User |

- Indexes: `{ salonId: 1, createdAt: -1 }`, `{ salonId: 1, transactionNumber: 1 }` (unique)

**Counter** — Atomic sequence generator
| Field | Type | Notes |
|-------|------|-------|
| _id | String | Format: `txn_{salonId}_{YYYYMMDD}` |
| seq | Number | Auto-incremented via `$inc` with upsert |

### Relationships

- Every query must include `salonId` (tenant isolation)
- `salonId` is derived from the JWT, never from client request
- Transaction services are **snapshots** (price/name at time of sale), not live references

## API

### Authentication

All protected endpoints require a valid `token` HttpOnly cookie containing a signed JWT.

**JWT Payload:**
```json
{
  "userId": " ObjectId",
  "salonId": " ObjectId",
  "role": "owner"
}
```

### Response Format

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message"
  }
}
```

### Endpoints

#### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Create salon + owner account |
| POST | `/api/auth/login` | No | Owner login, sets JWT cookie |
| POST | `/api/auth/logout` | No | Clears JWT cookie |
| GET | `/api/auth/me` | Yes | Returns current user from JWT |

**POST /api/auth/register**

Request:
```json
{
  "salonName": "My Salon",
  "salonPhone": "+919876543210",
  "salonAddress": "123 Main St",
  "name": "Owner Name",
  "email": "owner@example.com",
  "password": "password123"
}
```

Validation: `salonName` (1-100 chars), `salonPhone` (required), `salonAddress` (required), `name` (1-100 chars), `email` (valid), `password` (min 6 chars).

Response: `201` with `{ user: { id, salonId, name, email, role } }` + Sets `token` cookie.

**POST /api/auth/login**

Request:
```json
{
  "email": "owner@example.com",
  "password": "password123"
}
```

Response: `200` with `{ user: { id, salonId, name, email, role } }` + Sets `token` cookie.

Error codes: `AUTH_INVALID_CREDENTIALS`, `AUTH_ACCOUNT_DISABLED`.

#### Services

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/services` | Yes | List services (paginated, searchable) |
| POST | `/api/services` | Yes | Create service (supports multipart/form-data) |
| GET | `/api/services/[id]` | Yes | Get service by ID |
| PATCH | `/api/services/[id]` | Yes | Update service |
| DELETE | `/api/services/[id]` | Yes | Delete service |

**GET /api/services** — Query params: `page`, `limit`, `category`, `search`

**POST /api/services** — Accepts `multipart/form-data` or JSON:
- `name` (required), `category`, `price` (required, integer), `image` (File, optional)
- Image: max 5MB, types: JPEG, PNG, WebP, GIF. Stored as base64 data URL.

**DELETE /api/services/[id]** — Permanently deletes the service.

#### Transactions

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/transactions` | Yes | List transactions (paginated, filterable) |
| POST | `/api/transactions` | Yes | Create transaction (owner only) |
| GET | `/api/transactions/[id]` | Yes | Get transaction detail |

**GET /api/transactions** — Query params: `page`, `limit`, `search` (by transaction number), `from`, `to` (YYYY-MM-DD), `paymentMethod`, `paymentStatus`

**POST /api/transactions**

Request:
```json
{
  "services": [
    { "serviceId": " ObjectId", "quantity": 2 }
  ],
  "discount": {
    "type": "percentage",
    "value": 10
  },
  "paymentMethod": "cash",
  "notes": "Optional note"
}
```

- Server fetches current prices from DB (never trusts frontend prices)
- `paymentMethod`: `cash` | `upi` | `card` | `other`
- `paymentStatus` auto-derived: `paid` (full amount), `partial`, or `pending`
- `amountPaid` auto-calculated based on payment status
- Transaction number generated atomically: `TXN-YYYYMMDD-NNNN`

#### Reports

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/reports/dashboard` | Yes (owner) | Combined dashboard data |

**GET /api/reports/dashboard** — Query params: `range` (today|yesterday|this-week|this-month|last-month)

Response includes:
- `summary`: grossSales, discounts, netSales, amountCollected, amountDue, transactions, averageBill
- `dailySales`: per-day sales trend (zero-filled for days with no transactions)
- `topServices`: top 5 services by revenue
- `payments`: breakdown by payment method with percentages
- `recentTransactions`: last 8 transactions

Runs 5 parallel aggregation queries server-side via `Promise.all`.

#### Health

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | No | Database connection status |

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: 20+)
- MongoDB (local or Atlas)
- npm

### Installation

```bash
git clone <repository-url>
cd salon
npm install
```

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection URI | `mongodb://localhost:27017/salon` |
| `MONGODB_DB_NAME` | Database name | `salon` |
| `SESSION_SECRET` | JWT signing secret (min 32 chars) | `<random-32-char-string>` |
| `NODE_ENV` | Environment | `development` |
| `NEXT_PUBLIC_APP_NAME` | App display name | `Salon Management System` |

### Database Setup

**Local MongoDB:**
1. Install MongoDB Community Edition
2. Start: `mongod --dbpath ./data`
3. Set `MONGODB_URI=mongodb://localhost:27017/salon`

**MongoDB Atlas:**
1. Create cluster at [mongodb.com/cloud](https://mongodb.com/cloud)
2. Get connection string
3. Update `MONGODB_URI` in `.env`
4. Whitelist your IP in Atlas network access

### Seed Data (Optional)

To seed sample services for a specific salon:

```bash
node scripts/seed-services.js
```

> **Note:** The seed script has a hardcoded `SALON_ID`. You must update it to match your salon's `_id` from the database.

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint (next lint) |

> **Note:** There are no test scripts configured in `package.json`. The old README referenced `npm run test:expenses` and `npm run test:reports` but these do not exist in the codebase.

## Authentication

### Login Flow

1. User submits email + password to `POST /api/auth/login`
2. Server finds user by email, checks `isActive`
3. Compares password via bcryptjs
4. Signs JWT with `{ userId, salonId, role }` payload, 7-day expiry
5. Sets `token` cookie: `HttpOnly`, `SameSite=Strict`, `Path=/`, `Max-Age=604800`
6. In production, also sets `Secure` flag

### Logout Flow

1. `POST /api/auth/logout` clears the `token` cookie (sets `Max-Age=0`)

### Route Protection

Protection is applied in three layers:

1. **Middleware** (`middleware.js`) — first line of defense at the edge/server level. Intercepts all page routes before rendering. Checks the `token` cookie for a valid JWT. Redirects unauthenticated users to `/login?redirect=<path>`. Passes `x-user-id`, `x-salon-id`, and `x-user-role` headers to downstream handlers. API routes (`/api/*`) are excluded from the matcher and handle their own auth.

2. **`AuthGuard`** (`components/AuthGuard.js`) — client component wrapping the dashboard layout. Calls `GET /api/auth/me` on mount; redirects to `/login` if unauthorized. Provides a second check in case middleware is bypassed or the cookie is cleared client-side.

3. **Server Components** — each dashboard page individually reads cookies via `next/headers`, verifies JWT, and redirects to `/login` if invalid. Provides defense-in-depth.

4. **API routes** — each calls `verifyAuth(request)` which parses cookies and verifies JWT independently.

### Middleware Details

```
Request → middleware.js
  ├── Public route (/login, /register, /) → pass through
  ├── No token cookie → redirect to /login
  ├── Invalid/expired JWT → redirect to /login
  └── Valid JWT → pass through + inject x-user-id, x-salon-id, x-user-role headers
```

**Matcher:** All routes except `_next/static`, `_next/image`, `favicon.ico`, `robots.txt`, `sitemap.xml`, and static files (`*.*`).

**Public routes:** `/`, `/login`, `/register`

### Cookie Security

| Flag | Value | Purpose |
|------|-------|---------|
| `HttpOnly` | `true` | Prevents JavaScript access (XSS protection) |
| `SameSite` | `Strict` | Prevents CSRF attacks |
| `Secure` | `true` (production) | HTTPS only |
| `Max-Age` | `604800` (7 days) | Session expiry |

## Services

### Implemented Functionality

- **List services** with search by name, category filter, pagination
- **Add service** with name, category, price (integer), optional image
- **Edit service** — update name, category, price, image (or remove image)
- **Delete service** — permanent deletion with confirmation dialog
- **Image handling** — client-side preview, stored as base64 data URL in MongoDB
- **Duplicate detection** — case-insensitive duplicate name check per salon
- **Card grid view** — responsive 1-4 column grid with image cards

### Image Constraints

- Max size: 5MB
- Allowed types: JPEG, PNG, WebP, GIF
- Storage: base64 data URL in `Service.image` field
- No external file storage or CDN

## Transactions

### Implemented Functionality

- **Create transaction** — select services from card grid, adjust quantities, apply discount (fixed/percentage), choose payment method
- **Transaction number** — auto-generated `TXN-YYYYMMDD-NNNN` format using atomic counter per salon per day
- **Server-side calculation** — all amounts (subtotal, discount, finalAmount, amountPaid, amountDue) computed server-side
- **Payment methods** — Cash, UPI, Card, Other
- **Payment status** — auto-derived: `paid`, `partial`, or `pending`
- **Transaction list** — search by transaction number, filter by payment method, paginated
- **Transaction detail** — full receipt view with print support
- **Notes** — optional text field per transaction

### Discount Rules

- **Fixed discount**: value ≤ subtotal, rounded with `Math.floor`
- **Percentage discount**: value ≤ 100%, amount = `Math.floor(subtotal × percentage / 100)`
- Default when no discount: `{ type: "fixed", value: 0, amount: 0 }`

### Payment Status Derivation

| Status | Amount Paid | Amount Due |
|--------|-------------|------------|
| `paid` | `finalAmount` | `0` |
| `partial` | `0 < amount < finalAmount` | `finalAmount - amountPaid` |
| `pending` | `0` | `finalAmount` |

## Dashboard

### Implemented Functionality

- **Date range filtering** — Today, Yesterday, This Week, This Month, Last Month
- **Summary cards** — Total Sales, Collected, Due, Discounts, Transactions, Average Bill
- **Daily sales trend** — bar chart (CSS/SVG, no chart library) with zero-fill for days without sales
- **Top services** — ranked by revenue (top 5)
- **Payment breakdown** — Cash, UPI, Card, Other with amounts and percentages
- **Recent transactions** — last 8 transactions with links to detail page
- **Auto-refresh** — data refreshes when browser tab becomes visible

### Date/Timezone Handling

- All queries use `Asia/Kolkata` (IST, UTC+05:30)
- Date boundaries: `createdAt >= startOfDay && createdAt < startOfNextDay`
- Daily grouping via MongoDB `$dateToString` with timezone parameter
- Server-side date math in `lib/dates/timezone.js` — never trusts server locale

## Responsive Design

- **Mobile-first** Tailwind CSS approach
- **Navigation** — horizontal links, wraps on small screens
- **Service grid** — 1 column (mobile) → 2 (sm) → 3 (lg) → 4 (xl)
- **Dashboard** — responsive grid layouts for cards and charts
- **Transaction form** — stacked layout (mobile) → side-by-side (lg)
- **Print receipt** — hides navigation and buttons via `@media print`

## Error Handling

### Server-side

- Custom `AppError` class with `message`, `statusCode`, `errorCode`, `details`
- API routes catch errors and return consistent `{ success: false, error: { code, message } }` format
- Mongoose errors handled: `ValidationError` (422), duplicate key (409), `CastError` (400)
- Technical details logged to console, safe messages returned to client

### Client-side

- Error states displayed in red banners with retry buttons
- Loading states with animated placeholders
- Form validation errors shown inline

## Security

| Mechanism | Implementation |
|-----------|---------------|
| Authentication | JWT in HttpOnly cookies |
| Route protection | Edge middleware verifies JWT before page rendering |
| Authorization | Owner role check on protected endpoints |
| Tenant isolation | All queries scoped to `salonId` from JWT |
| Password hashing | bcryptjs with 12 salt rounds |
| Input validation | Zod schemas on registration |
| Server-side calculation | All monetary amounts computed server-side |
| Cookie security | HttpOnly, SameSite=Strict, Secure (production) |
| Error safety | No stack traces or secrets exposed to client |

### Known Security Notes

- Rate limiting is not implemented on login attempts
- No CSRF token (relies on SameSite=Strict cookies)
- Service images stored as base64 in MongoDB (no external storage)
- No input sanitization beyond Zod validation

## Known Issues

1. **Old README is inaccurate** — The existing README documents Phase 4 (reports) and Phase 5 (expenses) features that do not exist in the codebase. There are no expense models, expense API endpoints, or expense UI pages. There are no report endpoints beyond `/api/reports/dashboard`. The test scripts (`npm run test:expenses`, `npm run test:reports`) do not exist.

2. **Validation schema mismatch** — `validations/transactionCreate.js` defines a `customerId` field in `transactionCreateSchema`, but the actual transaction API and model do not use `customerId`. The Zod schemas in `validations/` are not consistently used across all API routes (e.g., login route uses manual validation instead of `loginSchema`).

3. **Seed script has hardcoded salon ID** — `scripts/seed-services.js` has `SALON_ID` hardcoded to a specific ObjectId. This must be manually updated for each salon.

4. **No `.next` in `.gitignore`** — The `.gitignore` only excludes `.env` and `node_modules`. The `.next` build directory is not excluded (though it may not be committed).

5. **Service deletion is permanent** — Services are permanently deleted from the database. If a service is referenced in existing transactions, the transaction still stores the service name/price as a snapshot, but the `serviceId` reference becomes orphaned.

6. **No transaction editing or deletion** — Once created, transactions cannot be modified or deleted through the UI or API.

## Current Limitations

- No expense tracking or P&L reporting
- No customer management
- No staff/employee accounts
- No appointment booking
- No inventory management
- No automated tests
- No Docker/deployment configuration
- No CI/CD pipeline
- No rate limiting
- No API documentation beyond this README
- No multi-branch support
- Service images stored as base64 (not suitable for large-scale deployment)
- Transaction receipts show generic "Salon" name (does not display actual salon name from DB)

## Future Scope

Planned but not yet implemented:
- Expense tracking with categories
- Financial reporting and P&L
- Customer management
- Staff accounts and commission tracking
- Appointment booking system
- Inventory management
- Membership/loyalty programs
- WhatsApp integration
- Multi-branch support

## License

Proprietary — Not for public redistribution.
