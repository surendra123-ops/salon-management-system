const { z } = require("zod")

const loginSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(1, "Password is required")
    .regex(/^.{6,}$/, "Password must be at least 6 characters"),
})

const registerSchema = z.object({
  salonName: z
    .string()
    .min(1, "Salon name is required")
    .max(100, "Salon name cannot exceed 100 characters")
    .trim(),
  salonPhone: z
    .string()
    .min(1, "Salon phone is required")
    .trim(),
  salonAddress: z
    .string()
    .min(1, "Salon address is required")
    .trim(),
  name: z
    .string()
    .min(1, "Your name is required")
    .max(100, "Name cannot exceed 100 characters")
    .trim(),
  email: z
    .string()
    .email("Please enter a valid email address")
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(1, "Password is required")
    .regex(/^.{6,}$/, "Password must be at least 6 characters"),
})

module.exports = {
  loginSchema,
  registerSchema,
}