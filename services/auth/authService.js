const User = require("../../models/User")
const AppError = require("../../lib/errors/AppError")
const jwt = require("jsonwebtoken")

/**
 * Login user and create session
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Object} - Token and user data
 */
const login = async (email, password) => {
  // Find user by email (includes salonId)
  const user = await User.findOne({ email }).select("+passwordHash")

  if (!user) {
    throw new AppError("Invalid email or password", 401, "AUTH_INVALID_CREDENTIALS")
  }

  if (!user.isActive) {
    throw new AppError("Account is disabled", 401, "AUTH_ACCOUNT_DISABLED")
  }

  // Compare password
  const isMatch = await user.comparePassword(password)

  if (!isMatch) {
    throw new AppError("Invalid email or password", 401, "AUTH_INVALID_CREDENTIALS")
  }

  // Create JWT payload (exclude passwordHash)
  const payload = {
    userId: user._id,
    salonId: user.salonId,
    role: user.role,
  }

  // Sign token
  const token = jwt.sign(payload, require("../../config/env").env.SESSION_SECRET, {
    expiresIn: "7d",
  })

  return {
    token,
    user: user.toJSON(),
  }
}

/**
 * Register a new salon owner (creates Salon + User)
 * @param {Object} data - Registration data
 * @returns {Object} - Token and user data
 */
const register = async ({ salonName, salonPhone, salonAddress, name, email, password }) => {
  const Salon = require("../../models/Salon")
  const User = require("../../models/User")

  // Check if email already taken
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    throw new AppError("Email already registered", 409, "AUTH_EMAIL_EXISTS")
  }

  // Create salon
  const salon = await Salon.create({
    name: salonName,
    phone: salonPhone,
    address: salonAddress,
  })

  // Create user linked to salon
  const user = await User.create({
    salonId: salon._id,
    name,
    email,
    passwordHash: password, // pre-save hook hashes it
    role: "owner",
  })

  // Sign token
  const payload = {
    userId: user._id,
    salonId: salon._id,
    role: user.role,
  }

  const token = jwt.sign(payload, require("../../config/env").env.SESSION_SECRET, {
    expiresIn: "7d",
  })

  return {
    token,
    user: user.toJSON(),
  }
}

/**
 * Get current authenticated user
 * @param {Object} payload - JWT payload
 * @returns {Object} - Safe user data
 */
const getCurrentUser = (payload) => {
  if (!payload || !payload.userId) {
    throw new AppError("Unauthorized", 401, "AUTH_UNAUTHORIZED")
  }

  // In a real app, you'd fetch the user from DB
  // For now, return the payload data (safe fields only)
  return {
    id: payload.userId,
    salonId: payload.salonId,
    role: payload.role,
  }
}

/**
 * Logout user (invalidate session)
 * @param {string} token - JWT token to invalidate
 */
const logout = async (token) => {
  // In a cookie-based approach, we just clear the cookie
  // The server-side session can be invalidated in Redis, but for Phase 1
  // we rely on the cookie expiry
  return { success: true }
}

module.exports = {
  login,
  register,
  getCurrentUser,
  logout,
}