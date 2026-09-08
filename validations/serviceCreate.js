const { z } = require("zod")

const serviceCreateSchema = z.object({
  name: z
    .string()
    .min(1, "Service name is required")
    .trim()
    .max(100, "Service name cannot exceed 100 characters"),
  category: z
    .string()
    .min(1, "Service category is required")
    .trim()
    .max(50, "Service category cannot exceed 50 characters"),
  price: z
    .number()
    .finite("Price must be a valid number")
    .min(0, "Price must be at least 0")
    .int("Price must be a whole number")
    .optional(),
})

const serviceUpdateSchema = z.object({
  name: z
    .string()
    .trim()
    .max(100, "Service name cannot exceed 100 characters")
    .optional(),
  category: z
    .string()
    .trim()
    .max(50, "Service category cannot exceed 50 characters")
    .optional(),
  price: z
    .number()
    .finite("Price must be a valid number")
    .min(0, "Price must be at least 0")
    .int("Price must be a whole number")
    .optional(),
})

module.exports = {
  serviceCreateSchema,
  serviceUpdateSchema,
}