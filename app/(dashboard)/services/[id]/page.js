"use client"

import { useState, useEffect } from "react"

const ServiceDetailPage = () => {
  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState("")
  const [category, setCategory] = useState("")
  const [price, setPrice] = useState("")
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [removeImage, setRemoveImage] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchService()
  }, [])

  const fetchService = async () => {
    try {
      const pathParts = window.location.pathname.split("/")
      const id = pathParts[pathParts.length - 1]
      const response = await fetch(`/api/services/${id}`, { cache: "no-store" })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || "Failed to fetch service")
      }
      const data = await response.json()
      setService(data.data)
      setName(data.data.name)
      setCategory(data.data.category || "")
      setPrice(data.data.price.toString())
      setImagePreview(data.data.image)
    } catch (err) {
      setError(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      setError("Invalid image type. Allowed: JPEG, PNG, WebP, GIF")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB")
      return
    }

    setImage(file)
    setRemoveImage(false)
    setError("")
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setImage(null)
    setImagePreview(null)
    setRemoveImage(true)
  }

  const handleSave = async () => {
    setSaving(true)
    setError("")

    const priceNum = Number(price)
    if (!priceNum || priceNum < 0 || !Number.isInteger(priceNum)) {
      setError("Price must be a non-negative integer")
      setSaving(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("category", category)
      formData.append("price", priceNum.toString())

      if (removeImage) {
        formData.append("image", "")
      } else if (image) {
        formData.append("image", image)
      }

      const response = await fetch(`/api/services/${service.id}`, {
        method: "PATCH",
        body: formData,
      })

      const data = await response.json()
      if (!response.ok) {
        setError(data.error?.message || "Failed to update service")
        setSaving(false)
        return
      }

      setService(data.data)
      setImagePreview(data.data.image)
      setImage(null)
      setRemoveImage(false)
      setEditing(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <p className="text-gray-600 animate-pulse">Loading service...</p>
        </div>
      </div>
    )
  }

  if (error && !service) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8 text-center">
            <p className="text-red-600">Error: {error}</p>
            <button onClick={() => window.history.back()} className="mt-4 px-4 py-2 bg-button-primary text-button-text rounded-md hover:opacity-90">Go Back</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 max-w-2xl mx-auto">
      <div className="bg-card rounded-lg shadow-xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-primary">{editing ? "Edit Service" : "Service Details"}</h2>
          <button onClick={() => window.history.back()} className="text-secondary hover:text-primary">Back</button>
        </div>

        {success && <div className="bg-accent-total-bg text-green-800 p-4 rounded mb-6">Service updated successfully!</div>}
        {error && <div className="bg-red-100 text-red-800 p-4 rounded mb-6">{error}</div>}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">Service Image</label>
            {editing ? (
              <div>
                <input type="file" accept="image/*" onChange={handleImageChange} className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-button-primary" />
                {imagePreview && (
                  <div className="mt-2 flex items-center gap-3">
                    <img src={imagePreview} alt="Preview" className="w-24 h-24 object-cover rounded" />
                    <button onClick={handleRemoveImage} className="text-sm text-red-600 hover:text-red-800">Remove Image</button>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {service?.image ? (
                  <img src={service.image} alt={service.name} className="w-32 h-32 object-cover rounded" />
                ) : (
                  <div className="w-32 h-32 bg-background rounded flex items-center justify-center text-secondary text-sm">No Image</div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-2">Service Name *</label>
            {editing ? (
              <input value={name} onChange={(e) => setName(e.target.value)} type="text" className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-button-primary" required />
            ) : (
              <p className="text-primary font-medium">{service?.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-2">Category *</label>
            {editing ? (
              <input value={category} onChange={(e) => setCategory(e.target.value)} type="text" className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-button-primary" required />
            ) : (
              <p className="text-primary">{service?.category || "Uncategorized"}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-2">Price (in INR) *</label>
            {editing ? (
              <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" min="0" step="1" className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-button-primary" required />
            ) : (
              <p className="text-primary font-bold text-lg">₹{Number(service?.price || 0).toLocaleString("en-IN")}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            {editing ? (
              <>
                <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-button-primary text-button-text rounded-md hover:opacity-90 font-medium disabled:opacity-50">
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button onClick={() => { setEditing(false); setError(""); setName(service.name); setCategory(service.category || ""); setPrice(service.price.toString()); setImagePreview(service.image); setImage(null); setRemoveImage(false) }} className="px-6 py-2 border border-gray-300 text-secondary rounded-md hover:bg-background font-medium">
                  Cancel
                </button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} className="px-6 py-2 bg-button-primary text-button-text rounded-md hover:opacity-90 font-medium">
                Edit Service
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ServiceDetailPage
