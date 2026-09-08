"use client"

import { useState, useEffect, useCallback } from "react"
import { ToastContainer } from "../ui/Toast"

let toastId = 0

const TransactionsManager = ({ initialTransactions, initialTotal }) => {
  const [transactions, setTransactions] = useState(initialTransactions)
  const [total, setTotal] = useState(initialTotal)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [filterPaymentMethod, setFilterPaymentMethod] = useState("")
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((type, message) => {
    const id = ++toastId
    setToasts((prev) => [...prev.slice(-2), { id, type, message }])
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true)
      setError("")
      const query = new URLSearchParams({ page: page.toString(), limit: limit.toString() })
      if (search.trim()) query.append("search", search.trim())
      if (filterPaymentMethod) query.append("paymentMethod", filterPaymentMethod)

      const response = await fetch(`/api/transactions?${query.toString()}`, { cache: "no-store" })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || "Failed to fetch transactions")
      }
      const data = await response.json()
      setTransactions(data.data.transactions || [])
      setTotal(data.data.pagination?.total || 0)
    } catch (err) {
      setError(err.message || "Unable to load transactions. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [page, limit, search, filterPaymentMethod])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchTransactions()
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [fetchTransactions])

  useEffect(() => {
    setPage(1)
  }, [search, filterPaymentMethod])

  const totalPages = Math.ceil(total / limit) || 1

  const formatCurrency = (amount) => "₹" + (amount || 0).toLocaleString("en-IN")

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

  const getPaymentMethodLabel = (method) => ({ cash: "Cash", upi: "UPI", card: "Card", other: "Other" }[method] || method)

  const getStatusStyle = (status) => {
    if (status === "paid") return "bg-emerald-50 text-emerald-700 border-emerald-200"
    if (status === "partial") return "bg-amber-50 text-amber-700 border-amber-200"
    if (status === "pending") return "bg-red-50 text-red-700 border-red-200"
    return "bg-gray-50 text-gray-700 border-gray-200"
  }

  const hasActiveFilters = search || filterPaymentMethod

  const clearFilters = () => {
    setSearch("")
    setFilterPaymentMethod("")
  }

  return (
    <>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
            <p className="text-sm text-gray-500 mt-1">View all salon transactions.</p>
          </div>
          <button
            onClick={() => (window.location.href = "/transactions/new")}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors shadow-sm shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Transaction
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by transaction number..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
            />
          </div>
          <select
            value={filterPaymentMethod}
            onChange={(e) => setFilterPaymentMethod(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white transition-colors"
          >
            <option value="">All Methods</option>
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="card">Card</option>
          </select>
        </div>
        {hasActiveFilters && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-gray-500">Filters active</span>
            <button onClick={clearFilters} className="text-xs text-primary-600 hover:text-primary-700 font-medium">
              Clear all
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
          <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <p className="text-sm flex-1">{error}</p>
          <button onClick={fetchTransactions} className="text-sm font-medium text-red-700 hover:text-red-800 underline">
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 animate-pulse flex items-center gap-4">
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32" />
                  <div className="h-3 bg-gray-100 rounded w-24" />
                </div>
                <div className="h-4 bg-gray-200 rounded w-20" />
                <div className="h-5 bg-gray-200 rounded-full w-14" />
              </div>
            ))}
          </div>
        </div>
      ) : transactions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {hasActiveFilters ? "No matching transactions" : "No transactions yet"}
            </h3>
            <p className="text-sm text-gray-500 mb-6 text-center max-w-sm">
              {hasActiveFilters
                ? "Try adjusting your search or filters."
                : "Create your first transaction to start tracking sales."}
            </p>
            {hasActiveFilters ? (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={() => (window.location.href = "/transactions/new")}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                New Transaction
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {transactions.map((txn) => (
                <div
                  key={txn.id}
                  onClick={() => (window.location.href = `/transactions/${txn.id}`)}
                  className="flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm font-semibold text-gray-900">{txn.transactionNumber}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDate(txn.createdAt)} at {formatTime(txn.createdAt)}
                    </p>
                  </div>
                  <div className="hidden sm:block text-sm text-gray-500 max-w-[200px] truncate">
                    {Array.isArray(txn.services) ? txn.services.join(", ") : ""}
                  </div>
                  <div className="text-sm text-gray-500 capitalize shrink-0">
                    {getPaymentMethodLabel(txn.paymentMethod)}
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border shrink-0 ${getStatusStyle(txn.paymentStatus)}`}>
                    {txn.paymentStatus}
                  </span>
                  <p className="text-sm font-bold text-gray-900 shrink-0 w-20 text-right">{formatCurrency(txn.finalAmount)}</p>
                  <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              ))}
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Page {page} of {totalPages} ({total} transactions)
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (page <= 3) {
                    pageNum = i + 1
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = page - 2 + i
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-9 h-9 text-sm font-medium rounded-lg transition-colors ${
                        page === pageNum
                          ? "bg-primary-600 text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </>
  )
}

export default TransactionsManager
