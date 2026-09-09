"use client"

import { useState, useEffect, useCallback } from "react"
import Modal from "../ui/Modal"
import { ToastContainer } from "../ui/Toast"
import ConfirmDialog from "../ui/ConfirmDialog"
import ServiceForm from "../services/ServiceForm"
import ServiceCard from "../services/ServiceCard"
import EmptyState from "../services/EmptyState"

let toastId = 0

const ServicesManager = ({ initialServices, initialTotal }) => {
  const [services, setServices] = useState(initialServices)
  const [totalServices, setTotalServices] = useState(initialTotal)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [toasts, setToasts] = useState([])

  const [showAddModal, setShowAddModal] = useState(false)
  const [addLoading, setAddLoading] = useState(false)

  const [editService, setEditService] = useState(null)
  const [editLoading, setEditLoading] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const addToast = useCallback((type, message) => {
    const id = ++toastId
    setToasts((prev) => [...prev.slice(-2), { id, type, message }])
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true)
      setError("")
      const params = new URLSearchParams({ page: "1", limit: "200" })
      if (search.trim()) params.set("search", search.trim())
      const response = await fetch(`/api/services?${params}`, { cache: "no-store" })
      if (!response.ok) throw new Error("Failed to load services")
      const data = await response.json()
      setServices(data.data.services || [])
      setTotalServices(data.data.pagination?.total || 0)
    } catch (err) {
      setError("Unable to load services. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    if (search) fetchServices()
  }, [fetchServices, search])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchServices()
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [fetchServices])

  const handleAddService = async (formData) => {
    setAddLoading(true)
    try {
      const response = await fetch("/api/services", { method: "POST", body: formData })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error?.message || "Failed to create service")
      }
      setShowAddModal(false)
      addToast("success", "Service added successfully")
      fetchServices()
    } catch (err) {
      addToast("error", err.message || "Unable to create service. Please try again.")
    } finally {
      setAddLoading(false)
    }
  }

  const handleEditService = async (formData) => {
    if (!editService) return
    setEditLoading(true)
    try {
      const response = await fetch(`/api/services/${editService.id}`, { method: "PATCH", body: formData })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error?.message || "Failed to update service")
      }
      setEditService(null)
      addToast("success", "Service updated successfully")
      fetchServices()
    } catch (err) {
      addToast("error", err.message || "Unable to update service. Please try again.")
    } finally {
      setEditLoading(false)
    }
  }

  const handleDeleteService = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      const response = await fetch(`/api/services/${deleteTarget.id}`, { method: "DELETE" })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error?.message || "Failed to delete service")
      }
      setDeleteTarget(null)
      addToast("success", "Service deleted")
      fetchServices()
    } catch (err) {
      addToast("error", err.message || "Unable to delete service. Please try again.")
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">Services</h1>
            <p className="text-sm text-secondary mt-1">Manage the services offered by your business.</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-button-text bg-button-primary rounded-lg hover:opacity-90 transition-colors shadow-sm shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Service
          </button>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-gray-200 p-4 mb-6">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search services..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-button-primary focus:border-button-primary outline-none transition-colors"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
          <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <p className="text-sm flex-1">{error}</p>
          <button onClick={fetchServices} className="text-sm font-medium text-red-700 hover:text-red-800 underline">
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-card rounded-xl border border-gray-200 p-4 animate-pulse">
              <div className="w-full h-40 bg-background rounded-lg mb-3" />
              <div className="h-4 bg-background rounded w-2/3 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="bg-card rounded-xl border border-gray-200">
          <EmptyState onAddService={() => setShowAddModal(true)} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onEdit={setEditService}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <Modal isOpen={showAddModal} onClose={() => !addLoading && setShowAddModal(false)} title="Add Service">
        <ServiceForm
          onSubmit={handleAddService}
          onCancel={() => !addLoading && setShowAddModal(false)}
          loading={addLoading}
          mode="add"
        />
      </Modal>

      <Modal isOpen={!!editService} onClose={() => !editLoading && setEditService(null)} title="Edit Service">
        {editService && (
          <ServiceForm
            initialData={editService}
            onSubmit={handleEditService}
            onCancel={() => !editLoading && setEditService(null)}
            loading={editLoading}
            mode="edit"
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => !deleteLoading && setDeleteTarget(null)}
        onConfirm={handleDeleteService}
        title="Delete Service"
        message={`Are you sure you want to delete ${deleteTarget?.name || "this service"}? This action cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteLoading}
      />

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </>
  )
}

export default ServicesManager
