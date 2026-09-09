import { redirect, notFound } from "next/navigation"
import { connectDB } from "../../../../lib/auth"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { env } from "../../../../config/env"
import Transaction from "../../../../models/Transaction"
import TransactionActions from "../../../../components/transactions/TransactionActions"

const formatCurrency = (amount) => "₹" + (amount || 0).toLocaleString("en-IN")
const formatDateTime = (dateStr) => {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })
}
const getPaymentMethodLabel = (method) => ({ cash: "Cash", upi: "UPI", card: "Card", other: "Other" }[method] || method)
const getPaymentStatusColor = (status) => {
  if (status === "paid") return "bg-green-100 text-green-800"
  if (status === "partial") return "bg-yellow-100 text-yellow-800"
  if (status === "pending") return "bg-red-100 text-red-800"
  return "bg-gray-100 text-gray-800"
}

export default async function TransactionDetailPage({ params }) {
  const { id } = await params

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

  const transaction = await Transaction.findOne({
    _id: id,
    salonId: payload.salonId,
  }).lean()

  if (!transaction) {
    notFound()
  }

  const t = {
    id: transaction._id.toString(),
    transactionNumber: transaction.transactionNumber,
    services: transaction.services.map((s) => ({
      serviceName: s.serviceName,
      price: s.price,
      quantity: s.quantity,
      total: s.total,
    })),
    subtotal: transaction.subtotal,
    discount: transaction.discount,
    finalAmount: transaction.finalAmount,
    paymentMethod: transaction.paymentMethod,
    paymentStatus: transaction.paymentStatus,
    amountPaid: transaction.amountPaid,
    amountDue: transaction.amountDue,
    notes: transaction.notes,
    createdAt: transaction.createdAt?.toISOString(),
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-card rounded-lg shadow-xl mb-6 p-4 no-print">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-primary">Transaction Details</h1>
            <TransactionActions id={t.id} />
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-xl p-8" id="receipt">
          <div className="text-center border-b border-gray-200 pb-6 mb-6">
            <h2 className="text-2xl font-bold text-primary">Salon</h2>
            <p className="text-secondary mt-1">Receipt</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-secondary">Transaction Number</p>
              <p className="font-mono font-medium text-primary">{t.transactionNumber}</p>
            </div>
            <div>
              <p className="text-sm text-secondary">Date & Time</p>
              <p className="text-primary">{formatDateTime(t.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-secondary">Payment Method</p>
              <p className="text-primary">{getPaymentMethodLabel(t.paymentMethod)}</p>
            </div>
            <div>
              <p className="text-sm text-secondary">Payment Status</p>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPaymentStatusColor(t.paymentStatus)}`}>
                {t.paymentStatus}
              </span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 mb-6">
            <h3 className="text-sm font-medium text-secondary mb-4">Services</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left pb-2">Service</th>
                  <th className="text-right pb-2">Price</th>
                  <th className="text-right pb-2">Qty</th>
                  <th className="text-right pb-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {t.services.map((svc, idx) => (
                  <tr key={idx} className="border-b border-gray-100">
                    <td className="py-2 text-primary">{svc.serviceName}</td>
                    <td className="py-2 text-right text-secondary">{formatCurrency(svc.price)}</td>
                    <td className="py-2 text-right text-secondary">{svc.quantity}</td>
                    <td className="py-2 text-right font-medium text-primary">{formatCurrency(svc.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-gray-200 pt-6 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-secondary">Subtotal</span>
              <span className="font-medium">{formatCurrency(t.subtotal)}</span>
            </div>
            {t.discount?.amount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount {t.discount.type === "percentage" && `(${t.discount.value}%)`}</span>
                <span className="font-medium">-{formatCurrency(t.discount.amount)}</span>
              </div>
            )}
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between text-lg font-bold">
                <span>Final Amount</span>
                <span className="text-button-primary">{formatCurrency(t.finalAmount)}</span>
              </div>
            </div>
            {t.paymentStatus !== "paid" && (
              <>
                <div className="flex justify-between text-secondary">
                  <span>Amount Paid</span>
                  <span>{formatCurrency(t.amountPaid)}</span>
                </div>
                <div className="flex justify-between text-red-600 font-medium">
                  <span>Amount Due</span>
                  <span>{formatCurrency(t.amountDue)}</span>
                </div>
              </>
            )}
          </div>

          {t.notes && (
            <div className="border-t border-gray-200 pt-4 mt-4">
              <p className="text-sm text-secondary">Notes</p>
              <p className="text-primary">{t.notes}</p>
            </div>
          )}

          <div className="text-center mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-secondary">Thank you for your visit!</p>
            <p className="text-xs text-secondary mt-1">This is a receipt, not a tax invoice.</p>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          #receipt { box-shadow: none; border: none; }
        }
      `}} />
    </div>
  )
}
