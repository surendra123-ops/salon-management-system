const formatCurrency = (amount) => {
  const value = Number(amount)
  if (isNaN(value)) return "₹0"
  return "₹" + value.toLocaleString("en-IN", { maximumFractionDigits: 2 })
}

const formatNumber = (value) => {
  if (isNaN(value)) return "0"
  return Number(value).toLocaleString("en-IN")
}

const formatDate = (dateStr) => {
  if (!dateStr) return "—"
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
}

const getPaymentMethodLabel = (method) => {
  const labels = { cash: "Cash", upi: "UPI", card: "Card", other: "Other" }
  return labels[method] || method
}

const getPaymentStatusColor = (status) => {
  if (status === "paid") return "bg-green-100 text-green-800"
  if (status === "partial") return "bg-yellow-100 text-yellow-800"
  if (status === "pending") return "bg-red-100 text-red-800"
  return "bg-gray-100 text-gray-800"
}

export {
  formatCurrency,
  formatNumber,
  formatDate,
  getPaymentMethodLabel,
  getPaymentStatusColor,
}
