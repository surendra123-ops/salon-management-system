const { z } = require("zod")

const transactionServiceSchema = z.object({
  serviceId: z.string().min(1, "Service ID is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1").optional(),
})

const transactionDiscountSchema = z.object({
  type: z.enum(["fixed", "percentage"], { errorMap: () => ({ message: "Discount type must be fixed or percentage" }) }),
  value: z.number().finite().min(0, "Discount value must be at least 0"),
})

const transactionCreateSchema = z.object({
  customerId: z.string().min(1, "Customer ID is required"),
  services: z.array(transactionServiceSchema).min(1, "At least one service is required"),
  discount: transactionDiscountSchema.optional(),
  paymentMethod: z.enum(["cash", "upi", "card", "other"], { errorMap: () => ({ message: "Invalid payment method" }) }),
  paymentStatus: z.enum(["paid", "partial", "pending"]).optional(),
  amountPaid: z.number().finite().min(0).optional(),
  notes: z.string().max(500).optional(),
})

const transactionUpdateSchema = z.object({
  services: z.array(transactionServiceSchema).min(1, "At least one service is required").optional(),
  discount: transactionDiscountSchema.optional(),
  paymentMethod: z.enum(["cash", "upi", "card", "other"]).optional(),
  paymentStatus: z.enum(["paid", "partial", "pending"]).optional(),
  amountPaid: z.number().finite().min(0).optional(),
  notes: z.string().max(500).optional(),
  customerId: z.string().min(1).optional(),
})

const transactionQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  paymentMethod: z.enum(["cash", "upi", "card", "other"]).optional(),
  paymentStatus: z.enum(["paid", "partial", "pending"]).optional(),
})

module.exports = {
  transactionCreateSchema,
  transactionUpdateSchema,
  transactionQuerySchema,
}