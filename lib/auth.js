const jwt = require("jsonwebtoken")
const connectDB = require("./db/mongodb")

function parseCookies(request) {
  const cookieHeader = request.headers.get("cookie") || ""
  return Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [key, ...rest] = c.trim().split("=")
      return [key, rest.join("=")]
    })
  )
}

function verifyAuth(request) {
  const { env } = require("../config/env")
  const cookies = parseCookies(request)
  const token = cookies.token
  if (!token) return null
  try {
    return jwt.verify(token, env.SESSION_SECRET)
  } catch (e) {
    return null
  }
}

function unauthorizedResponse() {
  return Response.json(
    { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
    { status: 401 }
  )
}

module.exports = { parseCookies, verifyAuth, unauthorizedResponse, connectDB }
