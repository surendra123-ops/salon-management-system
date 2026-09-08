import { NextResponse } from "next/server"

const PUBLIC_PATHS = ["/login", "/register", "/"]

function parseCookies(cookieHeader) {
  const map = new Map()
  if (!cookieHeader) return map
  for (const part of cookieHeader.split(";")) {
    const [key, ...rest] = part.trim().split("=")
    if (key) map.set(key, rest.join("="))
  }
  return map
}

async function verifyTokenAsync(token, secret) {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null

    const [headerB64, payloadB64, signatureB64] = parts

    const header = JSON.parse(atob(headerB64.replace(/-/g, "+").replace(/_/g, "/")))
    if (header.alg !== "HS256") return null

    const payload = JSON.parse(atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/")))
    if (payload.exp && payload.exp * 1000 < Date.now()) return null

    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"])

    const data = encoder.encode(`${headerB64}.${payloadB64}`)
    const signature = Uint8Array.from(atob(signatureB64.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0))

    const valid = await crypto.subtle.verify("HMAC", key, signature, data)
    if (!valid) return null

    return payload
  } catch {
    return null
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)"],
}

export async function middleware(request) {
  const { pathname } = request.nextUrl

  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next()
  }

  const cookieHeader = request.headers.get("cookie") || ""
  const cookies = parseCookies(cookieHeader)
  const token = cookies.get("token")

  if (!token) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  const SESSION_SECRET = process.env.SESSION_SECRET
  if (!SESSION_SECRET || SESSION_SECRET.length < 32) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const payload = await verifyTokenAsync(token, SESSION_SECRET)
  if (!payload) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-user-id", payload.userId || "")
  requestHeaders.set("x-salon-id", payload.salonId || "")
  requestHeaders.set("x-user-role", payload.role || "")

  return NextResponse.next({
    request: { headers: requestHeaders },
  })
}