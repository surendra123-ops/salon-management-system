"use client"

import { useState } from "react"

const TransactionForm = ({ initialServices }) => {
  const [services] = useState(initialServices)
  const [selectedServices, setSelectedServices] = useState([])
  const [serviceSearch, setServiceSearch] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(null)

  const handleAddService = (service) => {
    const existing = selectedServices.find((s) => s.serviceId === service.id)
    if (existing) {
      setSelectedServices((prev) =>
        prev.map((s) => (s.serviceId === service.id ? { ...s, quantity: s.quantity + 1 } : s))
      )
    } else {
      setSelectedServices((prev) => [
        ...prev,
        { serviceId: service.id, serviceName: service.name, price: Number(service.price), quantity: 1, image: service.image },
      ])
    }
  }

  const handleUpdateQuantity = (serviceId, delta) => {
    setSelectedServices((prev) =>
      prev
        .map((s) => (s.serviceId === serviceId ? { ...s, quantity: Math.max(0, s.quantity + delta) } : s))
        .filter((s) => s.quantity > 0)
    )
  }

  const handleRemoveService = (serviceId) => {
    setSelectedServices((prev) => prev.filter((s) => s.serviceId !== serviceId))
  }

  const subtotal = selectedServices.reduce((sum, s) => sum + s.price * s.quantity, 0)
  const finalAmount = subtotal

  const handleSubmit = async () => {
    if (selectedServices.length === 0) {
      setError("Please add at least one service")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          services: selectedServices.map((s) => ({ serviceId: s.serviceId, quantity: s.quantity })),
          paymentMethod,
          notes: notes.trim() || undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error?.message || "Failed to create transaction")
      }

      const data = await response.json()
      setSuccess(data.data)
    } catch (err) {
      setError(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background p-4 pt-12">
        <div className="max-w-md mx-auto">
          <div className="bg-card rounded-2xl border border-gray-200 p-10 text-center shadow-sm">
            <div className="w-20 h-20 bg-accent-total-bg rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-primary mb-3">Transaction Completed</h2>
            <p className="text-base text-secondary mb-2">Transaction number</p>
            <p className="font-mono text-xl font-semibold text-gray-900 mb-5">{success.transactionNumber}</p>
            <p className="text-4xl font-bold text-button-primary mb-8">
              ₹{success.finalAmount?.toLocaleString("en-IN")}
            </p>
            <div className="flex gap-4">
              <a
                href={`/transactions/${success.id}`}
                className="flex-1 px-5 py-3 text-base font-medium text-button-text bg-button-primary rounded-lg hover:opacity-90 transition-colors text-center"
              >
                View Receipt
              </a>
              <a
                href="/dashboard"
                className="flex-1 px-5 py-3 text-base font-medium text-secondary bg-card border border-gray-300 rounded-lg hover:bg-background transition-colors text-center"
              >
                Go to Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const filteredServices = serviceSearch.trim()
    ? services.filter(
        (s) => s.name.toLowerCase().includes(serviceSearch.toLowerCase()) || (s.category || "").toLowerCase().includes(serviceSearch.toLowerCase())
      )
    : services

  const groupedServices = filteredServices.reduce((groups, service) => {
    let cat = service.category || "Other"
    if (cat === "Other Services") cat = "Women's Services"
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(service)
    return groups
  }, {})

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-primary">New Transaction</h1>
              <p className="text-sm text-secondary mt-1">Select services and complete the sale.</p>
            </div>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-secondary bg-card border border-gray-300 rounded-lg hover:bg-background transition-colors shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
            <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <p className="text-sm flex-1">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-xl border border-gray-200 p-5">
              <h2 className="text-base font-semibold text-primary mb-4">Select Services</h2>
              <div className="relative mb-4">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  type="text"
                  value={serviceSearch}
                  onChange={(e) => setServiceSearch(e.target.value)}
                  placeholder="Search by name or category..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-button-primary focus:border-button-primary outline-none transition-colors"
                />
              </div>

              {Object.keys(groupedServices).length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-secondary">No services found.</p>
                  <a href="/services" className="text-sm text-button-primary hover:underline mt-1 inline-block">Add a service</a>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {Object.entries(groupedServices).map(([category, catServices]) => (
                    <div key={category}>
                      <h3 className="text-xs font-medium text-secondary mb-2 uppercase tracking-wide">{category}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {catServices.map((service) => {
                          const isSelected = selectedServices.some((s) => s.serviceId === service.id)
                          const selectedSvc = selectedServices.find((s) => s.serviceId === service.id)
                          return (
                            <button
                              key={service.id}
                              onClick={() => handleAddService(service)}
                              className={`text-left p-3 rounded-lg border transition-all duration-150 flex items-center gap-3 ${
                                isSelected
                                  ? "border-button-primary bg-accent-total-bg ring-1 ring-button-primary"
                                  : "border-gray-200 hover:border-gray-300 hover:bg-background"
                              }`}
                            >
                              {service.image ? (
                                <img src={service.image} alt={service.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center shrink-0">
                                  <svg className="w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
                                  </svg>
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-primary truncate">{service.name}</p>
                                <p className="text-sm text-button-primary font-semibold">₹{Number(service.price).toLocaleString("en-IN")}</p>
                              </div>
                              {isSelected && selectedSvc && (
                                <span className="shrink-0 w-6 h-6 bg-button-primary text-button-text rounded-full flex items-center justify-center text-xs font-bold">
                                  {selectedSvc.quantity}
                                </span>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedServices.length > 0 && (
              <div className="bg-card rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-primary">Selected Services</h2>
                  <span className="text-sm text-secondary">{selectedServices.length} item{selectedServices.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="space-y-2">
                  {selectedServices.map((svc) => (
                    <div key={svc.serviceId} className="flex items-center gap-3 p-3 bg-background rounded-lg">
                      {svc.image ? (
                        <img src={svc.image} alt={svc.serviceName} className="w-9 h-9 rounded-lg object-cover shrink-0" />
                      ) : null}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-primary truncate">{svc.serviceName}</p>
                        <p className="text-xs text-secondary">₹{svc.price.toLocaleString("en-IN")} each</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center bg-card border border-gray-200 rounded-lg">
                          <button
                            onClick={() => handleUpdateQuantity(svc.serviceId, -1)}
                            className="w-8 h-8 flex items-center justify-center text-secondary hover:text-primary rounded-l-lg hover:bg-background transition-colors"
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{svc.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(svc.serviceId, 1)}
                            className="w-8 h-8 flex items-center justify-center text-secondary hover:text-primary rounded-r-lg hover:bg-background transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <p className="text-sm font-semibold text-primary w-16 text-right">₹{(svc.price * svc.quantity).toLocaleString("en-IN")}</p>
                        <button
                          onClick={() => handleRemoveService(svc.serviceId)}
                          className="p-1 text-secondary hover:text-red-500 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-card rounded-xl border border-gray-200 p-5">
              <h2 className="text-base font-semibold text-primary mb-4">Payment</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[{ value: "cash", label: "Cash" }, { value: "upi", label: "UPI" }, { value: "card", label: "Card" }].map((m) => (
                      <button
                        key={m.value}
                        onClick={() => setPaymentMethod(m.value)}
                        className={`py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          paymentMethod === m.value
                            ? "bg-button-primary text-button-text"
                            : "bg-background text-secondary hover:bg-gray-200"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-secondary mb-2">Notes (optional)</label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-button-primary focus:border-button-primary outline-none transition-colors resize-none"
                    placeholder="Any notes..."
                  />
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-gray-200 p-5">
              <h2 className="text-base font-semibold text-primary mb-4">Bill Summary</h2>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium text-gray-900">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="text-base font-semibold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-button-primary">₹{finalAmount.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleSubmit}
                disabled={loading || selectedServices.length === 0}
                className="w-full mt-5 py-3 bg-button-primary text-button-text rounded-lg hover:opacity-90 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {loading ? "Processing..." : "Complete Transaction"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TransactionForm
