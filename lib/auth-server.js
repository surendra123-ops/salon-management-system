const { cookies } = require("next/headers")
const jwt = require("jsonwebtoken")
const connectDB = require("./db/mongodb")

/**
 * Server-side auth verification using next/headers cookies().
 * Use this in Server Components and Server Actions only.
 * Returns the JWT payload { salonId, userId, role } or null.
 */
async function verifyAuthServer() {
  const { env } = require("../config/env")
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value
  if (!token) return null
  try {
    return jwt.verify(token, env.SESSION_SECRET)
  } catch {
    return null
  }
}

/**
 * Server-side auth guard. Returns payload or throws redirect.
 * Use in Server Components that require authentication.
 */
async function requireAuthServer() {
  await connectDB()
  const payload = await verifyAuthServer()
  if (!payload) {
    const { redirect } = require("next/navigation")
    redirect("/login")
  }
  return payload
}

module.exports = { verifyAuthServer, requireAuthServer }
