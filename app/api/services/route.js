const { connectDB, verifyAuth, unauthorizedResponse } = require("../../../lib/auth")
const serviceService = require("../../../services/service/serviceService")
const AppError = require("../../../lib/errors/AppError")

export async function GET(request) {
  try {
    await connectDB()

    const payload = verifyAuth(request)
    if (!payload) return unauthorizedResponse()

    const { searchParams } = new URL(request.url)

    const result = await serviceService.listServices({
      salonId: payload.salonId,
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      category: searchParams.get("category"),
      search: searchParams.get("search"),
    })

    return Response.json({ success: true, data: result })
  } catch (error) {
    console.error("Service list error:", error)

    if (error instanceof AppError) {
      return Response.json(
        { success: false, error: { code: error.errorCode, message: error.message, details: error.details } },
        { status: error.statusCode }
      )
    }

    return Response.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    await connectDB()

    const payload = verifyAuth(request)
    if (!payload) return unauthorizedResponse()

    const contentType = request.headers.get("content-type") || ""

    let body
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()
      body = {
        name: formData.get("name"),
        category: formData.get("category"),
        price: formData.get("price") ? Number(formData.get("price")) : undefined,
        image: formData.get("image"),
      }
    } else {
      body = await request.json()
    }

    const result = await serviceService.createService({
      name: body.name,
      category: body.category,
      price: body.price,
      image: body.image,
      salonId: payload.salonId,
    })

    return Response.json({ success: true, data: result }, { status: 201 })
  } catch (error) {
    console.error("Service creation error:", error)

    if (error instanceof AppError) {
      return Response.json(
        { success: false, error: { code: error.errorCode, message: error.message, details: error.details } },
        { status: error.statusCode }
      )
    }

    return Response.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } },
      { status: 500 }
    )
  }
}
