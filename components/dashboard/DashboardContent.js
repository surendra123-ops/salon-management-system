"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import SummaryCard from "./SummaryCard"
import SimpleBarChart from "../charts/SimpleBarChart"

const RANGES = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "this-week", label: "This Week" },
  { value: "last-week", label: "Last Week" },
  { value: "this-month", label: "This Month" },
  { value: "last-month", label: "Last Month" },
]

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

const formatTime = (dateStr) => {
  if (!dateStr) return ""
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ""
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
}

const getPaymentMethodLabel = (method) => {
  const labels = { cash: "Cash", upi: "UPI", card: "Card", other: "Other" }
  return labels[method] || method
}

const getPaymentMethodIcon = (method) => {
  const icons = {
    cash: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z",
    upi: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z",
    card: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
    other: "M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z",
  }
  return icons[method] || icons.other
}

const DashboardContent = ({ initialData, hasData: initialHasData }) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const range = searchParams.get("range") || "today"

  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [hasData, setHasData] = useState(initialHasData)
  const isFirstRender = useRef(true)

  const fetchDashboard = useCallback(async (rangeOverride) => {
    setLoading(true)
    setError("")
    try {
      const queryRange = rangeOverride || range
      const params = new URLSearchParams()
      params.set("range", queryRange)
      const response = await fetch(`/api/reports/dashboard?${params.toString()}`, { cache: "no-store" })
      if (response.status === 401) {
        window.location.href = "/login"
        return
      }
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || "Failed to load data")
      }
      const json = await response.json()
      setData(json.data)
      setHasData((json.data.summary?.transactions || 0) > 0)
    } catch (err) {
      setError(err.message || "Unable to load data")
    } finally {
      setLoading(false)
    }
  }, [range])

  // Fetch data when range changes (skip first render since we have initialData)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    fetchDashboard()
  }, [range, fetchDashboard])

  const changeRange = (newRange) => {
    if (newRange === range) return
    router.replace(`/dashboard?range=${newRange}`)
    fetchDashboard(newRange)
  }

  const summary = data?.summary || {}
  const dailySales = data?.dailySales || []
  const topServices = data?.topServices || []
  const payments = (data?.payments || []).filter((p) => p.amount > 0)
  const recentTransactions = data?.recentTransactions || []

  return (
    <>
      {/* Header with Add Transaction Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-primary">Dashboard Overview</h2>
          <p className="text-sm text-secondary">Track your salon performance</p>
        </div>
        <a
          href="/transactions/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-button-primary text-button-text rounded-lg font-medium shadow-sm hover:opacity-90 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-button-primary focus-visible:ring-offset-2"
          aria-label="Add new transaction"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Transaction
        </a>
      </div>

      {/* Time Period Filter Tabs */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Select time period">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => changeRange(r.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                range === r.value
                  ? "bg-button-primary text-button-text shadow-sm"
                  : "bg-card border border-gray-200 text-secondary hover:border-button-primary hover:text-button-primary"
              }`}
              role="tab"
              aria-selected={range === r.value}
              aria-controls={`panel-${r.value}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-card rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="inline-flex items-center gap-3">
            <svg className="animate-spin h-5 w-5 text-button-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-secondary">Loading data...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="bg-card rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-primary mb-2">Unable to load data</h3>
          <p className="text-secondary mb-4">{error}</p>
          <button
            onClick={fetchDashboard}
            className="px-6 py-2.5 bg-button-primary text-button-text rounded-lg font-medium hover:opacity-90 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Main Content */}
      {!loading && !error && (
        <>
          {/* Summary Cards - Total Sales & Transactions */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <SummaryCard
              label="Total Sales"
              value={formatCurrency(summary.netSales)}
              sublabel="After discounts"
              accent="text-button-primary"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <SummaryCard
              label="Transactions"
              value={formatNumber(summary.transactions)}
              sublabel="Completed bills"
              accent="text-primary"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              }
            />
          </div>

          {/* Charts Section */}
          {hasData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-card rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-primary mb-4">Daily Sales Trend</h3>
              <SimpleBarChart
                data={dailySales.map((d) => ({ label: d.date, value: d.sales }))}
                formatValue={(d) => formatCurrency(d.value)}
              />
            </div>

              <div className="bg-card rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-primary mb-4">Payment Breakdown</h3>
                <SimpleBarChart
                  data={payments.map((p) => ({ label: getPaymentMethodLabel(p.method), value: p.amount }))}
                  formatValue={(d) => formatCurrency(d.value)}
                  color="bg-green-600"
                />
              </div>
            </div>
          )}

          {/* Transactions List */}
          <div className="bg-card rounded-xl shadow-sm border border-gray-100 mb-6">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-primary">Transactions</h3>
                <a
                  href="/transactions"
                  className="text-sm text-button-primary hover:underline font-medium"
                >
                  View All
                </a>
              </div>
            </div>

            {!hasData || recentTransactions.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-primary mb-2">No transactions yet</h4>
                <p className="text-secondary mb-6">Create your first transaction to start tracking sales.</p>
                <a
                  href="/transactions/new"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-button-primary text-button-text rounded-lg font-medium hover:opacity-90 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  New Transaction
                </a>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentTransactions.map((txn) => (
                  <a
                    key={txn.id}
                    href={`/transactions/${txn.id}`}
                    className="block p-4 hover:bg-background transition-colors focus:outline-none focus-visible:bg-background"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 bg-accent-total-bg rounded-lg flex items-center justify-center shrink-0">
                          <svg className="w-5 h-5 text-button-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d={getPaymentMethodIcon(txn.paymentMethod)} />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-primary truncate">
                            {Array.isArray(txn.services) ? txn.services.join(", ") : "Transaction"}
                          </p>
                          <p className="text-sm text-secondary font-mono">{txn.transactionNumber}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-semibold text-button-primary">{formatCurrency(txn.finalAmount)}</p>
                        <p className="text-xs text-secondary">
                          {getPaymentMethodLabel(txn.paymentMethod)} · {formatTime(txn.createdAt)}
                        </p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Top Services */}
          {hasData && topServices.length > 0 && (
            <div className="bg-card rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-primary">Top Services</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {topServices.map((s, i) => (
                    <div key={s.serviceId || i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-accent-total-bg text-sm font-semibold text-button-primary">
                          {i + 1}
                        </span>
                        <div>
                          <p className="font-medium text-primary">{s.serviceName}</p>
                          <p className="text-xs text-secondary">{s.quantity} services sold</p>
                        </div>
                      </div>
                      <span className="font-semibold text-button-primary">{formatCurrency(s.revenue)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  )
}

export default DashboardContent
