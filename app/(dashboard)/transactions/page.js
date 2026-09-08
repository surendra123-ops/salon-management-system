import { redirect } from "next/navigation"
import { connectDB } from "../../../lib/auth"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { env } from "../../../config/env"
import Transaction from "../../../models/Transaction"
import TransactionsManager from "../../../components/transactions/TransactionsManager"

export default async function TransactionsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  if (!token) {
    redirect("/login")
  }

  let payload
  try {
    await connectDB()
    payload = jwt.verify(token, env.SESSION_SECRET)
  } catch {
    redirect("/login")
  }

  const transactions = await Transaction.find({ salonId: payload.salonId })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean()

  const total = await Transaction.countDocuments({ salonId: payload.salonId })

  const formattedTransactions = transactions.map((t) => ({
    id: t._id.toString(),
    transactionNumber: t.transactionNumber,
    services: t.services.map((s) => s.serviceName),
    subtotal: t.subtotal,
    discount: t.discount,
    finalAmount: t.finalAmount,
    paymentMethod: t.paymentMethod,
    paymentStatus: t.paymentStatus,
    amountPaid: t.amountPaid,
    amountDue: t.amountDue,
    notes: t.notes,
    createdAt: t.createdAt?.toISOString(),
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <TransactionsManager initialTransactions={formattedTransactions} initialTotal={total} />
      </div>
    </div>
  )
}
