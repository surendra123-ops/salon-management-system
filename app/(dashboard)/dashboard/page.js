import { Suspense } from "react"
import { redirect } from "next/navigation"
import { connectDB, verifyAuth } from "../../../lib/auth"
import { resolveDateRange } from "../../../lib/dates/timezone"
import Transaction from "../../../models/Transaction"
import DashboardContent from "../../../components/dashboard/DashboardContent"

async function fetchDashboardData(rangeParam) {
  await connectDB()

  const { cookies } = require("next/headers")
  const jwt = require("jsonwebtoken")
  const { env } = require("../../../config/env")

  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value
  if (!token) return null

  let payload
  try {
    payload = jwt.verify(token, env.SESSION_SECRET)
  } catch {
    return null
  }

  if (payload.role !== "owner") return null

  const validRanges = ["today", "yesterday", "this-week", "this-month", "last-month"]
  const safeRange = validRanges.includes(rangeParam) ? rangeParam : "today"
  const { fromISO, toISO, from, to } = resolveDateRange(safeRange)

  const matchStage = {
    salonId: payload.salonId,
    createdAt: { $gte: fromISO, $lt: toISO },
  }

  const [summaryResult, dailySales, topServices, payments, recentTransactions] =
    await Promise.all([
      Transaction.aggregate([
        { $match: matchStage },
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
      Transaction.aggregate([
        { $match: matchStage },
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
      Transaction.aggregate([
        { $match: matchStage },
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
      Transaction.aggregate([
        { $match: matchStage },
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
      Transaction.find({
        salonId: payload.salonId,
        createdAt: { $gte: fromISO, $lt: toISO },
      })
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
    ])

  const summary = summaryResult[0] || { grossSales: 0, discounts: 0, netSales: 0, amountCollected: 0, amountDue: 0, transactions: 0 }
  const avgBill = summary.transactions > 0 ? Number((summary.netSales / summary.transactions).toFixed(2)) : 0

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
    from: from instanceof Date ? from.toISOString() : String(from),
    to: to instanceof Date ? to.toISOString() : String(to),
    summary: { ...summary, averageBill: avgBill },
    dailySales,
    topServices,
    payments: paymentsFormatted,
    recentTransactions: recentFormatted,
  }
}

export default async function DashboardPage({ searchParams }) {
  const params = await searchParams
  const range = params?.range || "today"

  const data = await fetchDashboardData(range)

  if (!data) {
    redirect("/login")
  }

  const hasData = (data.summary.transactions || 0) > 0

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, Owner</h1>
        <p className="text-gray-500 mt-1">Here&apos;s how your salon is performing.</p>
      </div>

      <DashboardContent initialData={data} hasData={hasData} />
    </div>
  )
}
