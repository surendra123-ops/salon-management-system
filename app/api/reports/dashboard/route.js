const { connectDB, verifyAuth, unauthorizedResponse } = require("../../../../lib/auth")
const AppError = require("../../../../lib/errors/AppError")
const { resolveDateRange } = require("../../../../lib/dates/timezone")
const Transaction = require("../../../../models/Transaction")

const matchStage = (salonId, fromISO, toISO) => ({
  $match: {
    salonId,
    createdAt: { $gte: fromISO, $lt: toISO },
  },
})

const getSummary = async (salonId, fromISO, toISO) => {
  const pipeline = [
    matchStage(salonId, fromISO, toISO),
    {
      $group: {
        _id: null,
        grossSales: { $sum: "$subtotal" },
        discounts: { $sum: "$discount.amount" },
        netSales: { $sum: "$finalAmount" },
        amountCollected: { $sum: "$amountPaid" },
        amountDue: { $sum: "$amountDue" },
        transactions: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        grossSales: 1,
        discounts: 1,
        netSales: 1,
        amountCollected: 1,
        amountDue: 1,
        transactions: 1,
      },
    },
  ]

  const [result] = await Transaction.aggregate(pipeline)

  if (!result) {
    return { grossSales: 0, discounts: 0, netSales: 0, amountCollected: 0, amountDue: 0, transactions: 0, averageBill: 0 }
  }

  const transactions = result.transactions || 0
  return {
    ...result,
    averageBill: transactions > 0 ? Number((result.netSales / transactions).toFixed(2)) : 0,
  }
}

const getTopServices = async (salonId, fromISO, toISO, limit = 5) => {
  return Transaction.aggregate([
    matchStage(salonId, fromISO, toISO),
    { $unwind: "$services" },
    {
      $group: {
        _id: "$services.serviceId",
        serviceName: { $first: "$services.serviceName" },
        quantity: { $sum: "$services.quantity" },
        revenue: { $sum: "$services.total" },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: limit },
    { $project: { _id: 0, serviceId: "$_id", serviceName: 1, quantity: 1, revenue: 1 } },
  ])
}

const getPaymentSummary = async (salonId, fromISO, toISO) => {
  const rows = await Transaction.aggregate([
    matchStage(salonId, fromISO, toISO),
    {
      $group: {
        _id: "$paymentMethod",
        amount: { $sum: "$amountPaid" },
        count: { $sum: 1 },
      },
    },
    { $sort: { amount: -1 } },
    { $project: { _id: 0, method: "$_id", amount: 1, count: 1 } },
  ])

  const total = rows.reduce((sum, row) => sum + row.amount, 0)
  const knownMethods = ["cash", "upi", "card", "other"]
  const methodMap = new Map(rows.map((row) => [row.method, row]))

  return knownMethods.map((method) => {
    const row = methodMap.get(method)
    return {
      method,
      amount: row ? row.amount : 0,
      count: row ? row.count : 0,
      percentage: total > 0 ? Number(((row ? row.amount : 0) / total) * 100).toFixed(2) : 0,
    }
  })
}

const getDailySales = async (salonId, fromISO, toISO, fromDateStr, toDateStr) => {
  const rows = await Transaction.aggregate([
    matchStage(salonId, fromISO, toISO),
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "Asia/Kolkata" } },
        sales: { $sum: "$finalAmount" },
        transactions: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, date: "$_id", sales: 1, transactions: 1 } },
  ])

  const rowMap = new Map(rows.map((row) => [row.date, row]))
  const dates = []
  let current = new Date(fromDateStr + "T00:00:00+05:30")
  const end = new Date(toDateStr + "T00:00:00+05:30")
  const { toISTDateString } = require("../../../../lib/dates/timezone")

  while (current <= end) {
    dates.push(toISTDateString(current))
    current.setTime(current.getTime() + 24 * 60 * 60 * 1000)
  }

  return dates.map((date) => ({
    date,
    sales: rowMap.get(date)?.sales || 0,
    transactions: rowMap.get(date)?.transactions || 0,
  }))
}

const getRecentTransactions = async (salonId, fromISO, toISO, limit = 8) => {
  const transactions = await Transaction.find({
    salonId,
    createdAt: { $gte: fromISO, $lt: toISO },
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean()

  return transactions.map((t) => ({
    id: t._id.toString(),
    transactionNumber: t.transactionNumber,
    services: t.services.map((s) => s.serviceName),
    finalAmount: t.finalAmount,
    paymentMethod: t.paymentMethod,
    createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : String(t.createdAt),
  }))
}

const resolveReportDateRange = (searchParams) => {
  const range = searchParams.get("range") || ""
  const fromRaw = searchParams.get("from")
  const toRaw = searchParams.get("to")

  const validRanges = ["today", "yesterday", "this-week", "last-week", "this-month", "last-month"]
  const isNamedRange = validRanges.includes(range)

  if (fromRaw || toRaw) {
    const datePattern = /^\d{4}-\d{2}-\d{2}$/
    if (!datePattern.test(fromRaw || "") || !datePattern.test(toRaw || "")) {
      throw new AppError("Invalid date format. Use YYYY-MM-DD.", 400, "REPORT_INVALID_DATE")
    }
    if (fromRaw > toRaw) {
      throw new AppError("The start date must be before the end date", 400, "REPORT_INVALID_RANGE")
    }
    const resolved = resolveDateRange("custom", fromRaw, toRaw)
    if (resolved.toISO.getTime() - resolved.fromISO.getTime() > 366 * 24 * 60 * 60 * 1000) {
      throw new AppError("The date range cannot exceed 366 days", 400, "REPORT_INVALID_RANGE")
    }
    return { ...resolved, range: "custom" }
  }

  const safeRange = isNamedRange ? range : "today"
  return { ...resolveDateRange(safeRange), range: safeRange }
}

export async function GET(request) {
  try {
    await connectDB()

    const payload = verifyAuth(request)
    if (!payload) return unauthorizedResponse()

    if (payload.role !== "owner") {
      return Response.json(
        { success: false, error: { code: "FORBIDDEN", message: "You don't have permission to access this resource" } },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const { fromISO, toISO, from, to, range } = resolveReportDateRange(searchParams)

    // Convert salonId from string to ObjectId for aggregation queries
    const mongoose = require("mongoose")
    const salonId = new mongoose.Types.ObjectId(payload.salonId)

    const [summary, dailySales, topServices, payments, recentTransactions] =
      await Promise.all([
        getSummary(salonId, fromISO, toISO),
        getDailySales(salonId, fromISO, toISO, from, to),
        getTopServices(salonId, fromISO, toISO, 5),
        getPaymentSummary(salonId, fromISO, toISO),
        getRecentTransactions(salonId, fromISO, toISO, 8),
      ])

    return Response.json({
      success: true,
      data: {
        range,
        from,
        to,
        summary,
        dailySales,
        topServices,
        payments,
        recentTransactions,
      },
    })
  } catch (error) {
    console.error("Dashboard report error:", error)

    if (error instanceof AppError) {
      return Response.json(
        { success: false, error: { code: error.errorCode, message: error.message, details: error.details } },
        { status: error.statusCode }
      )
    }

    return Response.json(
      { success: false, error: { code: "DASHBOARD_DATA_FAILED", message: "Unable to load sales data" } },
      { status: 500 }
    )
  }
}
