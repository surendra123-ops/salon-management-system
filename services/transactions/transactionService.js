const Transaction = require("../../models/Transaction")
const Service = require("../../models/Service")
const Counter = require("../../models/Counter")
const AppError = require("../../lib/errors/AppError")
const { validateTransactionCreation } = require("../../lib/calculations/transaction")

const generateTransactionNumber = async (salonId) => {
  const dateStr = new Date().toLocaleString("en-CA", { timeZone: "Asia/Kolkata" }).split("T")[0].replace(/-/g, "")
  const counterId = `txn_${salonId}_${dateStr}`

  const counter = await Counter.findOneAndUpdate(
    { _id: counterId },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  )

  const sequence = counter.seq.toString().padStart(4, "0")
  return `TXN-${dateStr}-${sequence}`
}

const createTransaction = async (payload) => {
  const {
    services,
    discount,
    paymentMethod,
    paymentStatus,
    amountPaid,
    notes,
    salonId,
    createdBy,
  } = payload

  if (!Array.isArray(services) || services.length === 0) {
    throw new AppError("At least one service is required", 400, "TRANSACTION_VALIDATION_ERROR")
  }

  if (!paymentMethod) {
    throw new AppError("Payment method is required", 400, "TRANSACTION_VALIDATION_ERROR")
  }

  const transactionServices = []
  let subtotal = 0

  for (const svc of services) {
    const { serviceId, quantity } = svc

    if (!serviceId) {
      throw new AppError("Service ID is required for each service", 400, "TRANSACTION_VALIDATION_ERROR")
    }

    const qty = Number(quantity) || 1
    if (qty < 1) {
      throw new AppError("Quantity must be at least 1", 400, "TRANSACTION_VALIDATION_ERROR")
    }

    const service = await Service.findOne({
      _id: serviceId,
      salonId,
    })

    if (!service) {
      throw new AppError("Service not found", 404, "SERVICE_NOT_FOUND")
    }

    const price = service.price
    const total = price * qty
    subtotal += total

    transactionServices.push({
      serviceId: service._id,
      serviceName: service.name,
      price,
      quantity: qty,
      total,
    })
  }

  const validation = await validateTransactionCreation({
    services: transactionServices.map(s => ({ price: s.price, quantity: s.quantity })),
    discount,
    paymentMethod,
    paymentStatus,
    amountPaid,
  })

  const transactionNumber = await generateTransactionNumber(salonId)

  const transaction = new Transaction({
    salonId,
    transactionNumber,
    services: transactionServices,
    subtotal: validation.subtotal,
    discount: validation.discount,
    finalAmount: validation.finalAmount,
    paymentMethod,
    paymentStatus: validation.paymentStatus,
    amountPaid: validation.amountPaid,
    amountDue: validation.amountDue,
    notes: notes ? notes.trim() : undefined,
    createdBy,
    updatedBy: createdBy,
  })

  await transaction.save()

  return formatTransactionResponse(transaction)
}

const listTransactions = async (params) => {
  const {
    salonId,
    page = 1,
    limit = 20,
    search,
    from,
    to,
    paymentMethod,
    paymentStatus,
  } = params

  const pageNum = Math.max(1, Math.floor(page))
  const limitNum = Math.min(Math.max(1, limit), 100)

  const filter = { salonId }

  if (search && search.trim()) {
    filter.transactionNumber = { $regex: new RegExp(search.trim(), "i") }
  }

  if (from || to) {
    filter.createdAt = {}
    if (from) {
      filter.createdAt.$gte = new Date(from + "T00:00:00+05:30")
    }
    if (to) {
      filter.createdAt.$lte = new Date(to + "T23:59:59.999+05:30")
    }
  }

  if (paymentMethod) {
    filter.paymentMethod = paymentMethod
  }

  if (paymentStatus) {
    filter.paymentStatus = paymentStatus
  }

  const total = await Transaction.countDocuments(filter)

  const transactions = await Transaction.find(filter)
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)
    .lean()

  const safeTransactions = transactions.map(t => formatTransactionResponse(t, false))

  return {
    transactions: safeTransactions,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  }
}

const getTransactionById = async (id, salonId) => {
  const transaction = await Transaction.findOne({
    _id: id,
    salonId,
  }).lean()

  if (!transaction) {
    throw new AppError("Transaction not found", 404, "TRANSACTION_NOT_FOUND")
  }

  return formatTransactionResponse(transaction, true)
}

const formatTransactionResponse = (transaction, includeDetails = false) => {
  const base = {
    id: transaction._id || transaction.id,
    salonId: transaction.salonId,
    transactionNumber: transaction.transactionNumber,
    subtotal: transaction.subtotal,
    discount: transaction.discount,
    finalAmount: transaction.finalAmount,
    paymentMethod: transaction.paymentMethod,
    paymentStatus: transaction.paymentStatus,
    amountPaid: transaction.amountPaid,
    amountDue: transaction.amountDue,
    notes: transaction.notes,
    createdBy: transaction.createdBy,
    updatedBy: transaction.updatedBy,
    createdAt: transaction.createdAt,
    updatedAt: transaction.updatedAt,
  }

  if (includeDetails) {
    base.services = transaction.services.map(s => ({
      serviceId: s.serviceId,
      serviceName: s.serviceName,
      price: s.price,
      quantity: s.quantity,
      total: s.total,
    }))
  } else {
    base.services = transaction.services.map(s => s.serviceName)
  }

  return base
}

module.exports = {
  createTransaction,
  listTransactions,
  getTransactionById,
  generateTransactionNumber,
}
