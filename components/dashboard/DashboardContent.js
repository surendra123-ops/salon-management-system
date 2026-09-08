"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import SummaryCard from "./SummaryCard"
import SimpleBarChart from "../charts/SimpleBarChart"

const RANGES = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "this-week", label: "This Week" },
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

const getPaymentMethodLabel = (method) => {
  const labels = { cash: "Cash", upi: "UPI", card: "Card", other: "Other" }
  return labels[method] || method
}

const DashboardContent = ({ initialData, hasData: initialHasData }) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const range = searchParams.get("range") || "today"

  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [hasData, setHasData] = useState(initialHasData)

  const buildQuery = useCallback(() => {
    const params = new URLSearchParams()
    params.set("range", range)
    return params.toString()
  }, [range])

  const fetchDashboard = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch(`/api/reports/dashboard?${buildQuery()}`, { cache: "no-store" })
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
  }, [buildQuery])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchDashboard()
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [fetchDashboard])

  const changeRange = (newRange) => {
    router.replace(`/dashboard?range=${newRange}`)
  }

  const summary = data?.summary || {}
  const dailySales = data?.dailySales || []
  const topServices = data?.topServices || []
  const payments = (data?.payments || []).filter((p) => p.amount > 0)
  const recentTransactions = data?.recentTransactions || []

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {RANGES.map((r) => (
          <button
            key={r.value}
            onClick={() => changeRange(r.value)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              range === r.value
                ? "bg-primary-600 text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <p className="text-gray-600 animate-pulse">Loading data...</p>
        </div>
      )}

      {!loading && error && (
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to load data</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <button onClick={fetchDashboard} className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium">
            Retry
          </button>
        </div>
      )}

      {!loading && !error && !hasData && (
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No transactions yet</h2>
          <p className="text-gray-500 mb-6">Create your first transaction to see it here.</p>
          <button onClick={() => (window.location.href = "/transactions/new")} className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium">
            + New Transaction
          </button>
        </div>
      )}

      {!loading && !error && hasData && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <SummaryCard label="Total Sales" value={formatCurrency(summary.netSales)} sublabel="After discounts" />
            <SummaryCard label="Collected" value={formatCurrency(summary.amountCollected)} sublabel="Amount received" accent="text-green-600" />
            <SummaryCard label="Due" value={formatCurrency(summary.amountDue)} sublabel="Outstanding" accent="text-red-600" />
            <SummaryCard label="Discounts" value={formatCurrency(summary.discounts)} sublabel={`Gross ${formatCurrency(summary.grossSales)}`} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <SummaryCard label="Transactions" value={formatNumber(summary.transactions)} sublabel="Completed bills" />
            <SummaryCard label="Average Bill" value={formatCurrency(summary.averageBill)} sublabel="Net sales / transactions" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-xl p-6">
              <h2 className="text-xl font-medium text-gray-700 mb-4">Daily Sales Trend</h2>
              <SimpleBarChart
                data={dailySales.map((d) => ({ label: d.date, value: d.sales }))}
                formatValue={(d) => formatCurrency(d.value)}
              />
            </div>

            <div className="bg-white rounded-lg shadow-xl p-6">
              <h2 className="text-xl font-medium text-gray-700 mb-4">Payment Breakdown</h2>
              <SimpleBarChart
                data={payments.map((p) => ({ label: getPaymentMethodLabel(p.method), value: p.amount }))}
                formatValue={(d) => formatCurrency(d.value)}
                color="bg-green-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-xl p-6">
              <h2 className="text-xl font-medium text-gray-700 mb-4">Top Services</h2>
              {topServices.length === 0 ? (
                <p className="text-gray-500 text-sm">No service data for this period.</p>
              ) : (
                <div className="space-y-3">
                  {topServices.map((s, i) => (
                    <div key={s.serviceId || i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                          {i + 1}
                        </span>
                        <span className="font-medium text-gray-800">{s.serviceName}</span>
                      </div>
                      <span className="font-semibold text-gray-900">{formatCurrency(s.revenue)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-medium text-gray-700">Recent Transactions</h2>
                <a href="/transactions" className="text-sm text-primary-600 hover:underline">View All</a>
              </div>
              {recentTransactions.length === 0 ? (
                <p className="text-gray-500 text-sm">No transactions for this period.</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {recentTransactions.map((txn) => (
                    <div key={txn.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {Array.isArray(txn.services) ? txn.services.join(", ") : "Transaction"}
                        </p>
                        <a href={`/transactions/${txn.id}`} className="text-xs text-primary-600 hover:underline font-mono">
                          {txn.transactionNumber}
                        </a>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(txn.finalAmount)}</p>
                        <p className="text-xs text-gray-500">
                          {getPaymentMethodLabel(txn.paymentMethod)}
                          <span className="mx-1">·</span>
                          {formatDate(txn.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default DashboardContent
