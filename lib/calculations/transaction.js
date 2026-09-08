const AppError = require("../errors/AppError")

/**
 * Transaction calculation utilities
 * All monetary values are in integer rupees (₹499 = 499, not 49900 paise)
 * Rounding policy: Math.floor for percentage discounts to avoid fractional currency
 * This policy is applied consistently server-side and must not be duplicated on frontend
 */

/**
 * Calculate subtotal from services array
 * subtotal = SUM(service.price × service.quantity)
 * @param {Array} services - Array of { price, quantity }
 * @returns {Number} - Subtotal in rupees
 */
const calculateSubtotal = (services) => {
  if (!Array.isArray(services) || services.length === 0) {
    return 0
  }

  return services.reduce((sum, service) => {
    const lineTotal = (service.price || 0) * (service.quantity || 1)
    return sum + lineTotal
  }, 0)
}

/**
 * Calculate discount amount based on discount config and subtotal
 * Validates discount rules and applies consistent rounding
 * @param {Object} discount - { type: "fixed" | "percentage", value: Number }
 * @param {Number} subtotal - Subtotal in rupees
 * @returns {Object} - { type, value, amount: Number }
 */
const calculateDiscount = (discount, subtotal) => {
  const { type, value } = discount

  if (!type) {
    throw new AppError("Discount type is required", 400, "INVALID_DISCOUNT")
  }

  if (value === undefined || value === null || value < 0) {
    throw new AppError("Discount value must be at least 0", 400, "INVALID_DISCOUNT")
  }

  let amount

  if (type === "fixed") {
    if (value > subtotal) {
      throw new AppError("Fixed discount cannot exceed subtotal", 400, "INVALID_DISCOUNT")
    }
    amount = Math.floor(value)
  } else if (type === "percentage") {
    if (value > 100) {
      throw new AppError("Percentage discount cannot exceed 100%", 400, "INVALID_DISCOUNT")
    }
    amount = Math.floor(subtotal * value / 100)
  } else {
    throw new AppError("Invalid discount type", 400, "INVALID_DISCOUNT")
  }

  return {
    type,
    value: Number(value),
    amount: Number(amount),
  }
}

/**
 * Calculate final amount after discount
 * finalAmount = subtotal - discount amount
 * @param {Number} subtotal - Subtotal in rupees
 * @param {Object} discount - { type, value, amount } from calculateDiscount
 * @returns {Number} - Final amount in rupees
 */
const calculateFinalAmount = (subtotal, discount) => {
  const discountAmount = discount.amount || 0
  const finalAmount = subtotal - discountAmount
  return Math.max(0, finalAmount)
}

/**
 * Calculate amount due based on payment status and amount paid
 * @param {Number} finalAmount - Final amount in rupees
 * @param {Number} amountPaidInput - Amount paid in rupees (can be 0)
 * @param {String} paymentStatus - "paid" | "partial" | "pending"
 * @returns {Object} - { amountPaid, amountDue, paymentStatus }
 */
const calculateAmountDue = (finalAmount, amountPaidInput, paymentStatus) => {
  let amountPaidCalculated = amountPaidInput || 0
  let amountDueCalculated = finalAmount - amountPaidCalculated
  let paymentStatusCalculated = paymentStatus

  if (paymentStatusCalculated === "paid") {
    amountPaidCalculated = finalAmount
    amountDueCalculated = 0
    paymentStatusCalculated = "paid"
  } else if (paymentStatusCalculated === "pending") {
    amountPaidCalculated = 0
    amountDueCalculated = finalAmount
    paymentStatusCalculated = "pending"
  } else if (paymentStatusCalculated === "partial") {
    if (amountPaidCalculated >= finalAmount) {
      amountPaidCalculated = finalAmount
      amountDueCalculated = 0
      paymentStatusCalculated = "paid"
    } else if (amountPaidCalculated <= 0) {
      amountPaidCalculated = 0
      amountDueCalculated = finalAmount
      paymentStatusCalculated = "pending"
    } else {
      amountDueCalculated = finalAmount - amountPaidCalculated
    }
  } else {
    amountPaidCalculated = finalAmount
    amountDueCalculated = 0
    paymentStatusCalculated = "paid"
  }

  return {
    amountPaid: Number(amountPaidCalculated),
    amountDue: Number(amountDueCalculated),
    paymentStatus: paymentStatusCalculated,
  }
}

/**
 * Validate discount configuration before calculation
 * @param {Object} discount - { type, value }
 * @param {Number} subtotal - Subtotal in rupees
 * @returns {Boolean} - True if valid
 */
const validateDiscount = (discount, subtotal) => {
  const { type, value } = discount

  if (!type) {
    throw new AppError("Discount type is required", 400, "INVALID_DISCOUNT")
  }

  if (value === undefined || value === null) {
    throw new AppError("Discount value is required", 400, "INVALID_DISCOUNT")
  }

  if (value < 0) {
    throw new AppError("Discount value must be at least 0", 400, "INVALID_DISCOUNT")
  }

  if (type === "fixed" && value > subtotal) {
    throw new AppError("Fixed discount cannot exceed subtotal", 400, "INVALID_DISCOUNT")
  }

  if (type === "percentage" && value > 100) {
    throw new AppError("Percentage discount cannot exceed 100%", 400, "INVALID_DISCOUNT")
  }

  return true
}

/**
 * Full validation for transaction creation
 * @param {Object} payload - Transaction creation payload
 * @returns {Object} - { valid: true, subtotal, discount, finalAmount, amountPaid, amountDue, paymentStatus }
 */
const validateTransactionCreation = async (payload) => {
  const { services, discount, paymentStatus, amountPaid: amountPaidInput } = payload

  if (!Array.isArray(services) || services.length === 0) {
    throw new AppError("At least one service is required", 400, "TRANSACTION_VALIDATION_ERROR")
  }

  const subtotal = calculateSubtotal(services)

  let discountCalculated = { type: "fixed", value: 0, amount: 0 }
  if (discount) {
    validateDiscount(discount, subtotal)
    discountCalculated = calculateDiscount(discount, subtotal)
  }

  const finalAmount = discountCalculated
    ? calculateFinalAmount(subtotal, discountCalculated)
    : subtotal

  const paymentValidation = calculateAmountDue(finalAmount, amountPaidInput, paymentStatus)

  const resolvedAmountPaid = paymentValidation.amountPaid
  const resolvedAmountDue = paymentValidation.amountDue
  const resolvedPaymentStatus = paymentValidation.paymentStatus

  if (resolvedAmountPaid < 0) {
    throw new AppError("Amount paid must be at least 0", 400, "INVALID_PAYMENT")
  }

  if (resolvedAmountPaid > finalAmount && resolvedPaymentStatus !== "paid") {
    throw new AppError("Amount paid exceeds final amount", 400, "INVALID_PAYMENT")
  }

  if (resolvedPaymentStatus === "paid" && resolvedAmountPaid !== finalAmount) {
    throw new AppError("Payment status must match amount paid", 400, "INVALID_PAYMENT")
  }

  if (resolvedPaymentStatus === "pending" && resolvedAmountPaid !== 0) {
    throw new AppError("Pending payment must have amount paid of 0", 400, "INVALID_PAYMENT")
  }

  if (
    resolvedPaymentStatus === "partial" &&
    (resolvedAmountPaid <= 0 || resolvedAmountPaid >= finalAmount)
  ) {
    throw new AppError(
      "Partial payment must have amount paid greater than 0 and less than final amount",
      400,
      "INVALID_PAYMENT"
    )
  }

  return {
    valid: true,
    subtotal,
    discount: discountCalculated,
    finalAmount,
    amountPaid: resolvedAmountPaid,
    amountDue: resolvedAmountDue,
    paymentStatus: resolvedPaymentStatus,
  }
}

module.exports = {
  calculateSubtotal,
  calculateDiscount,
  calculateFinalAmount,
  calculateAmountDue,
  validateDiscount,
  validateTransactionCreation,
  calculateLineTotal: (price, quantity) => Math.max(0, (price || 0) * (quantity || 1)),
}