"use client"

const paymentMethodIcons = {
  cash: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
    </svg>
  ),
  upi: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
    </svg>
  ),
  card: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
    </svg>
  ),
}

const statusStyles = {
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  partial: "bg-amber-50 text-amber-700 border-amber-200",
  pending: "bg-red-50 text-red-700 border-red-200",
}

const TransactionCard = ({ transaction, onView }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return "—"
    const d = new Date(dateStr)
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
  }

  const formatTime = (dateStr) => {
    if (!dateStr) return ""
    const d = new Date(dateStr)
    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
  }

  const serviceNames = Array.isArray(transaction.services) ? transaction.services : []

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="font-mono text-sm font-semibold text-gray-900">{transaction.transactionNumber}</p>
            <p className="text-xs text-gray-400 mt-0.5">{formatDate(transaction.createdAt)} at {formatTime(transaction.createdAt)}</p>
          </div>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusStyles[transaction.paymentStatus] || "bg-gray-50 text-gray-700 border-gray-200"}`}>
            {transaction.paymentStatus}
          </span>
        </div>

        <div className="mt-3">
          <p className="text-sm text-gray-600 truncate">
            {serviceNames.length > 0 ? serviceNames.join(", ") : "Services"}
          </p>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-gray-500">
            {paymentMethodIcons[transaction.paymentMethod] || paymentMethodIcons.cash}
            <span className="text-xs font-medium capitalize">{transaction.paymentMethod}</span>
          </div>
          <p className="text-lg font-bold text-gray-900">₹{(transaction.finalAmount || 0).toLocaleString("en-IN")}</p>
        </div>

        {transaction.amountDue > 0 && (
          <div className="mt-2 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <span className="text-xs text-amber-600 font-medium">₹{transaction.amountDue.toLocaleString("en-IN")} due</span>
          </div>
        )}
      </div>

      <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100">
        <button
          onClick={() => onView(transaction)}
          className="w-full text-center text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  )
}

export default TransactionCard
