const Service = require("../../models/Service")
const AppError = require("../../lib/errors/AppError")

const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]

const processImage = async (image) => {
  if (!image) return null

  if (typeof image === "string") {
    if (image.startsWith("data:image")) {
      return image
    }
    return null
  }

  if (image instanceof File || (image.size !== undefined && image.type !== undefined)) {
    if (!ALLOWED_IMAGE_TYPES.includes(image.type)) {
      throw new AppError(
        "Invalid image type. Allowed: JPEG, PNG, WebP, GIF",
        400,
        "SERVICE_INVALID_IMAGE_TYPE"
      )
    }

    if (image.size > MAX_IMAGE_SIZE) {
      throw new AppError(
        "Image size must be less than 5MB",
        400,
        "SERVICE_IMAGE_TOO_LARGE"
      )
    }

    const buffer = Buffer.from(await image.arrayBuffer())
    const base64 = buffer.toString("base64")
    return `data:${image.type};base64,${base64}`
  }

  return null
}

const createService = async (payload) => {
  const { name, category, price, image } = payload
  const salonId = payload.salonId

  if (!name || name.trim().length === 0) {
    throw new AppError("Service name is required", 400, "SERVICE_VALIDATION_ERROR")
  }

  if (price === undefined || isNaN(price) || price < 0) {
    throw new AppError("Service price must be a non-negative number", 400, "SERVICE_VALIDATION_ERROR")
  }

  const normalizedName = name.trim()
  const existingService = await Service.findOne({
    salonId,
    name: { $regex: new RegExp("^" + normalizedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$", "i") },
  })

  if (existingService) {
    throw new AppError(
      "A service with this name already exists in your salon",
      409,
      "SERVICE_DUPLICATE"
    )
  }

  const imageData = await processImage(image)

  const service = new Service({
    salonId,
    name: normalizedName,
    category: category ? category.trim() : "",
    price,
    image: imageData,
  })

  await service.save()

  return formatServiceResponse(service)
}

const listServices = async (params) => {
  const {
    salonId,
    page = 1,
    limit = 20,
    category,
    search,
  } = params

  const pageNum = Math.max(1, Math.floor(page))
  const limitNum = Math.min(Math.max(1, limit), 500)

  const filter = { salonId }

  if (category && category.trim()) {
    filter.category = category.trim()
  }

  if (search && search.trim()) {
    filter.name = { $regex: new RegExp(search.trim(), "i") }
  }

  const total = await Service.countDocuments(filter)

  const services = await Service.find(filter)
    .sort({ name: 1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)

  const safeServices = services.map((s) => formatServiceResponse(s))

  return {
    services: safeServices,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  }
}

const getServiceById = async (id, salonId) => {
  const service = await Service.findOne({
    _id: id,
    salonId,
  })

  if (!service) {
    throw new AppError("Service not found", 404, "SERVICE_NOT_FOUND")
  }

  return formatServiceResponse(service)
}

const updateService = async (id, updates, salonId) => {
  const service = await Service.findOne({
    _id: id,
    salonId,
  })

  if (!service) {
    throw new AppError("Service not found", 404, "SERVICE_NOT_FOUND")
  }

  if (updates.name !== undefined) {
    if (!updates.name || updates.name.trim().length === 0) {
      throw new AppError("Service name cannot be empty", 400, "SERVICE_VALIDATION_ERROR")
    }
    const normalizedName = updates.name.trim()
    const existingService = await Service.findOne({
      salonId,
      name: { $regex: new RegExp("^" + normalizedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$", "i") },
      _id: { $ne: id },
    })

    if (existingService) {
      throw new AppError(
        "A service with this name already exists in your salon",
        409,
        "SERVICE_DUPLICATE"
      )
    }
    service.name = normalizedName
  }

  if (updates.category !== undefined) {
    service.category = updates.category.trim()
  }

  if (updates.price !== undefined) {
    if (isNaN(updates.price) || updates.price < 0) {
      throw new AppError("Service price must be a non-negative number", 400, "SERVICE_VALIDATION_ERROR")
    }
    service.price = updates.price
  }

  if (updates.image !== undefined) {
    const imageData = await processImage(updates.image)
    service.image = imageData
  }

  await service.save()

  return formatServiceResponse(service)
}

const deleteService = async (id, salonId) => {
  const service = await Service.findOneAndDelete({
    _id: id,
    salonId,
  })

  if (!service) {
    throw new AppError("Service not found", 404, "SERVICE_NOT_FOUND")
  }

  return { success: true, message: "Service deleted" }
}

const formatServiceResponse = (service) => ({
  id: service._id,
  salonId: service.salonId,
  name: service.name,
  category: service.category,
  price: service.price,
  image: service.image || null,
  createdAt: service.createdAt,
  updatedAt: service.updatedAt,
})

module.exports = {
  createService,
  listServices,
  getServiceById,
  updateService,
  deleteService,
}
