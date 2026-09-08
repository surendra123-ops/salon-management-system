const { connectDB, verifyAuth, unauthorizedResponse } = require("../../../../lib/auth")
const serviceService = require("../../../../services/service/serviceService")
const AppError = require("../../../../lib/errors/AppError")

export async function GET(request, { params }) {
  try {
    await connectDB()

    const payload = verifyAuth(request)
    if (!payload) return unauthorizedResponse()

    const { id } = await params
    const result = await serviceService.getServiceById(id, payload.salonId)
    return Response.json({ success: true, data: result })
  } catch (error) {
    console.error("Service detail error:", error)

    if (error instanceof AppError) {
      return Response.json(
        { success: false, error: { code: error.errorCode, message: error.message } },
        { status: error.statusCode }
      )
    }

    return Response.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } },
      { status: 500 }
    )
  }
}

export async function PATCH(request, { params }) {
  try {
    await connectDB()

    const payload = verifyAuth(request)
    if (!payload) return unauthorizedResponse()

    const { id } = await params
    const contentType = request.headers.get("content-type") || ""

    let body
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()
      body = {}
      if (formData.has("name")) body.name = formData.get("name")
      if (formData.has("category")) body.category = formData.get("category")
      if (formData.has("price")) body.price = Number(formData.get("price"))
      if (formData.has("image")) body.image = formData.get("image")
      if (formData.get("removeImage") === "true") body.image = null
    } else {
      body = await request.json()
    }

    const result = await serviceService.updateService(id, body, payload.salonId)
    return Response.json({ success: true, data: result })
  } catch (error) {
    console.error("Service update error:", error)

    if (error instanceof AppError) {
      return Response.json(
        { success: false, error: { code: error.errorCode, message: error.message } },
        { status: error.statusCode }
      )
    }

    return Response.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB()

    const payload = verifyAuth(request)
    if (!payload) return unauthorizedResponse()

    const { id } = await params
    const result = await serviceService.deleteService(id, payload.salonId)
    return Response.json({ success: true, data: result })
  } catch (error) {
    console.error("Service delete error:", error)

    if (error instanceof AppError) {
      return Response.json(
        { success: false, error: { code: error.errorCode, message: error.message } },
        { status: error.statusCode }
      )
    }

    return Response.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } },
      { status: 500 }
    )
  }
}
