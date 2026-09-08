// Next.js middleware - minimal pass-through
// This file is required by Next.js App Router but primarily
// serves as a placeholder for future middleware needs.

// Next.js expects a middleware function export
export const config = {
  matcher: [],
}

export function middleware(request) {
  // Pass through to the request handler
  // Request ID setup is done in route handlers via lib/middleware
  return new Response(null, { status: 200 })
}