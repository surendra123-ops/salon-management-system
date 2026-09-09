const mongoose = require("mongoose")
const Transaction = require("../models/Transaction")
const { resolveDateRange } = require("./dates/timezone")

/**
 * Get dashboard data for a salon within a date range.
 * @param {string|ObjectId} salonId - The salon ID (will be cast to ObjectId)
 * @param {string} range - Named range: today, yesterday, this-week, last-week, this-month, last-month
 * @returns {Object} Dashboard data with summary, dailySales, topServices, payments, recentTransactions
 */
async function getDashboardData(salonId, range) {
  const { Types } = mongoose
  const salonObjectId = new Types.ObjectId(salonId)

  const validRanges = ["today", "yesterday", "this-week", "last-week", "this-month", "last-month"]
  const safeRange = validRanges.includes(range) ? range : "today"
  const { from, to, fromISO, toISO } = resolveDateRange(safeRange)

  // Base filter for all queries
  const baseFilter = {
    salonId: salonObjectId,
    createdAt: { $gte: fromISO, $lt: toISO },
  }

  // Run all queries in parallel
  const [summaryResult, dailySales, topServices, payments, recentTransactions] =
    await Promise.all([
      // Summary aggregation
      Transaction.aggregate([
        { $match: baseFilter },
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
        { $project: { _id: 0, grossSales: 1, discounts: 1, netSales: 1, amountCollected: 1, amountDue: 1, transactions: 1 } },
      ]),

      // Daily sales aggregation
      Transaction.aggregate([
        { $match: baseFilter },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "Asia/Kolkata" } },
            sales: { $sum: "$finalAmount" },
            transactions: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, date: "$_id", sales: 1, transactions: 1 } },
      ]),

      // Top services aggregation
      Transaction.aggregate([
        { $match: baseFilter },
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
        { $limit: 5 },
        { $project: { _id: 0, serviceId: "$_id", serviceName: 1, quantity: 1, revenue: 1 } },
      ]),

      // Payment breakdown aggregation
      Transaction.aggregate([
        { $match: baseFilter },
        {
          $group: {
            _id: "$paymentMethod",
            amount: { $sum: "$amountPaid" },
            count: { $sum: 1 },
          },
        },
        { $sort: { amount: -1 } },
        { $project: { _id: 0, method: "$_id", amount: 1, count: 1 } },
      ]),

      // Recent transactions (simple find)
      Transaction.find(baseFilter)
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
    ])

  // Format summary
  const summary = summaryResult[0] || {
    grossSales: 0,
    discounts: 0,
    netSales: 0,
    amountCollected: 0,
    amountDue: 0,
    transactions: 0,
  }
  const avgBill = summary.transactions > 0 ? Number((summary.netSales / summary.transactions).toFixed(2)) : 0

  // Format payments with all known methods
  const totalPaid = payments.reduce((sum, row) => sum + row.amount, 0)
  const knownMethods = ["cash", "upi", "card", "other"]
  const methodMap = new Map(payments.map((row) => [row.method, row]))
  const paymentsFormatted = knownMethods.map((method) => {
    const row = methodMap.get(method)
    return {
      method,
      amount: row ? row.amount : 0,
      count: row ? row.count : 0,
      percentage: totalPaid > 0 ? Number(((row ? row.amount : 0) / totalPaid) * 100).toFixed(2) : 0,
    }
  })

  // Format recent transactions
  const recentFormatted = recentTransactions.map((t) => ({
    id: t._id.toString(),
    transactionNumber: t.transactionNumber,
    services: t.services.map((s) => s.serviceName),
    finalAmount: t.finalAmount,
    paymentMethod: t.paymentMethod,
    createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : String(t.createdAt),
  }))

  return {
    range: safeRange,
    from,
    to,
    summary: { ...summary, averageBill: avgBill },
    dailySales,
    topServices,
    payments: paymentsFormatted,
    recentTransactions: recentFormatted,
  }
}

module.exports = { getDashboardData }
