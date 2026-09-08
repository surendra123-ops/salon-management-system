# Phase 1 Testing Checklist - Salon Management System

## Overview

This checklist documents the minimum testing requirements for Phase 1 foundation.
All tests should pass before considering Phase 1 complete.

## 1. MongoDB Connection

### Test Steps

- [ ] Start the development server (`npm run dev`)
- [ ] Verify no MongoDB connection errors in console
- [ ] Test that `connect()` utility reuses existing connection (check no "connecting" logs on subsequent requests)
- [ ] Stop MongoDB and verify useful error message appears
- [ ] Restart MongoDB and verify recovery

### Expected Behavior

- Successful connection: `database: "connected"` in health check
- Connection failure: Clear error message, no stack traces exposed

## 2. Salon Model

### Test Steps

- [ ] Create a salon record via MongoDB or Tinker
- [ ] Verify required fields (name, phone, address)
- [ ] Verify defaults (currency="INR", timezone="Asia/Kolkata", isActive=true)
- [ ] Verify timestamps (createdAt, updatedAt) are set
- [ ] Verify index on `name` field

### Expected Behavior

- Validation rejects missing required fields
- Default values applied when not provided
- Timestamps auto-populated

## 3. User Model

### Test Steps

- [ ] Create a user record with valid data
- [ ] Verify passwordHash is NOT in the returned JSON (toJSON transform)
- [ ] Verify safe fields: id, salonId, name, email, role
- [ ] Hash password manually and verify `comparePassword` method
- [ ] Test invalid password comparison
- [ ] Verify indexes exist (salonId + email unique composite)
- [ ] Create user with missing required fields and verify validation error

### Expected Behavior

- Password never exposed in API responses
- `comparePassword` correctly validates credentials
- Mongoose validation catches missing fields
- Indexes support efficient tenant-isolated queries

## 4. Authentication - Login

### Test Steps

- [ ] Start dev server and ensure MongoDB is running
- [ ] Create a salon and owner user in MongoDB (or use tinker/seed)
- [ ] POST `/api/auth/login` with valid email/password
- [ ] Verify response has `{ success: true, data: { user: { id, name, email, role, salonId } } }`
- [ ] Verify cookie `token` is set with httpOnly, secure, sameSite flags
- [ ] POST `/api/auth/login` with invalid password - expect 401
- [ ] POST `/api/auth/login` with non-existent email - expect 401 (no account enumeration)
- [ ] POST `/api/auth/login` with disabled account - expect 401

### Expected Behavior

- Valid login: Returns user data, sets HttpOnly cookie
- Invalid login: Returns `{ success: false, error: { code, message } }` without revealing whether email exists
- Cookie has: httpOnly, secure (prod), sameSite: strict, maxAge: 7d

## 5. Authentication - Logout

### Test Steps

- [ ] Login as owner (obtain cookie)
- [ ] POST `/api/auth/logout`
- [ ] Verify cookie `token` is cleared
- [ ] Verify response has `{ success: true, data: {} }`
- [ ] Verify `/api/auth/me` returns 401 after logout

### Expected Behavior

- Logout clears the cookie on client
- Post-logout requests are unauthenticated

## 6. Authentication - Current User

### Test Steps

- [ ] Login as owner (obtain cookie)
- [ ] GET `/api/auth/me`
- [ ] Verify response has `{ success: true, data: { user: { id, salonId, role } } }`
- [ ] Test without cookie - expect 401
- [ ] Test with invalid/expired token - expect 401

### Expected Behavior

- Authenticated user: Returns safe user data
- Unauthenticated user: `{ success: false, error: { code: "UNAUTHORIZED", message } }`

## 7. Protected Routes

### Test Steps

- [ ] Try to access dashboard route without authentication
- [ ] Verify 401 or redirect to login
- [ ] Login and verify dashboard is accessible

### Expected Behavior

- Unauthenticated requests to protected routes are rejected
- Authenticated requests proceed normally

## 8. Error Handling

### Test Steps

- [ ] Send invalid JSON body to any API endpoint - expect 422
- [ ] Send missing required fields - expect 422 with detail messages
- [ ] Test route with non-existent path - expect 404
- [ ] Verify error responses follow `{ success: false, error: { code, message } }` format

### Expected Behavior

- All errors follow consistent format
- Technical details logged to server console
- Users see only safe, human-readable messages

## 9. Validation

### Test Steps

- [ ] POST `/api/auth/login` with missing email - expect 422
- [ ] POST `/api/auth/login` with invalid email format - expect 422
- [ ] POST `/api/auth/login` with missing password - expect 422
- [ ] POST `/api/auth/login` with short password - expect 422

### Expected Behavior

- Zod validation catches all invalid inputs
- Clear error messages indicating which field and why
- Validation runs before business logic

## 10. Tenant Isolation

### Test Steps

- [ ] Create two salons in MongoDB
- [ ] Create users assigned to different salons
- [ ] Login as user from salon A
- [ ] Try to access resources with manipulated salonId - should fail
- [ ] Verify all API responses include proper salonId scoping

### Expected Behavior

- Users can only access their own salon's data
- salonId derived from authenticated session, never from request body
- No cross-salon data access possible

## 11. Health Check

### Test Steps

- [ ] GET `/api/health`
- [ ] Verify response format: `{ success: true, data: { status: "ok", database: "connected", timestamp: "..." } }`
- [ ] (Optional) Test with MongoDB disconnected

### Expected Behavior

- Healthy response: `status: "ok"`, `database: "connected"`
- Unhealthy response when database unavailable

## 12. Frontend Experience

### Test Steps

- [ ] Visit `/` (home page) - should show login prompt
- [ ] Visit `/(auth)/login` - login page should render
- [ ] Fill login form and submit - check states
- [ ] Check login states: Normal, Loading, Error, Success
- [ ] Button disabled during loading state
- [ ] Error messages are user-friendly (no stack traces)
- [ ] Dashboard page renders with placeholders
- [ ] "+ New Transaction" button visible in dashboard
- [ ] No "TypeError: Cannot read properties of undefined" visible to users

### Expected Behavior

- Polished UI with low cognitive load
- All error states handled gracefully
- User-friendly messages throughout

## Manual Test Checklist (Run After Setup)

```
1. npm install        # Install dependencies
2. npm run dev        # Start dev server
3. MongoDB running    # Ensure MongoDB is running
4. Create salon + user # Insert via MongoDB shell or seed script
5. Test: POST /api/auth/login (valid)
6. Test: POST /api/auth/login (invalid password)
7. Test: GET /api/auth/me (authenticated)
8. Test: GET /api/auth/me (unauthenticated)
9. Test: POST /api/auth/logout
10. Test: GET /api/health
11. Visit: http://localhost:3000
12. Visit: http://localhost:3000/(auth)/login
13. Check: No secrets in source code
14. Check: .env not committed
```

## Test Data Example

### Seed Salon

```javascript
db.salons.insertOne({
  name: "Test Salon",
  phone: "+1-555-0123",
  address: "123 Test Street",
  currency: "INR",
  timezone: "Asia/Kolkata"
})
```

### Seed Owner User

```javascript
db.users.insertOne({
  salonId: ObjectId("<salon_id>"),
  name: "Owner Name",
  email: "owner@salon.com",
  phone: "+1-555-0123",
  passwordHash: "$2a$12$..."  // bcrypt hash of "password123"
})
```