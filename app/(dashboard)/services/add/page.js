"use client"

import { useState } from "react"

const AddServicePage = () => {
  const [name, setName] = useState("")
  const [category, setCategory] = useState("")
  const [price, setPrice] = useState("")
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

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
    setError("")
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const priceNum = Number(price)
    if (!priceNum || priceNum < 0 || !Number.isInteger(priceNum)) {
      setError("Price must be a non-negative integer")
      setLoading(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("category", category)
      formData.append("price", priceNum.toString())
      if (image) formData.append("image", image)

      const response = await fetch("/api/services", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()
      if (!response.ok) {
        setError(data.error?.message || "Failed to create service")
        setLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => { window.location.href = "/services" }, 1500)
    } catch (err) {
      setError("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 max-w-2xl mx-auto">
      <div className="bg-card rounded-lg shadow-xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-primary mb-6 text-center">Add Service</h2>

        {success && <div className="bg-accent-total-bg text-green-800 p-4 rounded mb-6">Service added successfully!</div>}
        {error && <div className="bg-red-100 text-red-800 p-4 rounded mb-6">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">Service Image</label>
            <input type="file" accept="image/*" onChange={handleImageChange} className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-button-primary focus:border-transparent" />
            {imagePreview && (
              <div className="mt-2">
                <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-2">Service Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="Enter service name" className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-button-primary focus:border-transparent" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-2">Category *</label>
            <input value={category} onChange={(e) => setCategory(e.target.value)} type="text" placeholder="Enter service category" className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-button-primary focus:border-transparent" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-2">Price (in INR) *</label>
            <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" min="0" step="1" placeholder="Enter price" className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-button-primary focus:border-transparent" required />
            <p className="text-sm text-secondary mt-1">Price must be a non-negative integer</p>
          </div>

          <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-button-text bg-button-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-button-primary disabled:opacity-50">
            {loading ? "Saving..." : "Save Service"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AddServicePage
