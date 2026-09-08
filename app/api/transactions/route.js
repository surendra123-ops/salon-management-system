const { connectDB, verifyAuth, unauthorizedResponse } = require("../../../lib/auth")
const transactionService = require("../../../services/transactions/transactionService")
const AppError = require("../../../lib/errors/AppError")

export async function POST(request) {
  try {
    await connectDB()

    const payload = verifyAuth(request)
    if (!payload) return unauthorizedResponse()

    if (payload.role !== "owner") {
      return Response.json(
        { success: false, error: { code: "FORBIDDEN", message: "You don't have permission to access this resource" } },
        { status: 403 }
      )
    }

    const body = await request.json()

    const result = await transactionService.createTransaction({
      services: body.services,
      discount: body.discount,
      paymentMethod: body.paymentMethod,
      paymentStatus: body.paymentStatus,
      amountPaid: body.amountPaid,
      notes: body.notes,
      salonId: payload.salonId,
      createdBy: payload.userId,
    })

    return Response.json({ success: true, data: result }, { status: 201 })
  } catch (error) {
    console.error("Transaction creation error:", error)

    if (error instanceof AppError) {
      return Response.json(
        { success: false, error: { code: error.errorCode, message: error.message, details: error.details } },
        { status: error.statusCode }
      )
    }

    if (error.name === "ValidationError") {
      const errors = {}
      for (const [key, val] of Object.entries(error.errors)) {
        errors[key] = val.message
      }
      return Response.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Validation failed", details: errors } },
        { status: 422 }
      )
    }

    if (error.code === 11000) {
      return Response.json(
        { success: false, error: { code: "DUPLICATE_KEY", message: "A record with this value already exists" } },
        { status: 409 }
      )
    }

    if (error.name === "CastError") {
      return Response.json(
        { success: false, error: { code: "INVALID_ID", message: "Invalid identifier format" } },
        { status: 400 }
      )
    }

    return Response.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } },
      { status: 500 }
    )
  }
}

export async function GET(request) {
  try {
    await connectDB()

    const payload = verifyAuth(request)
    if (!payload) return unauthorizedResponse()

    const { searchParams } = new URL(request.url)

    const result = await transactionService.listTransactions({
      salonId: payload.salonId,
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      search: searchParams.get("search"),
      from: searchParams.get("from"),
      to: searchParams.get("to"),
      paymentMethod: searchParams.get("paymentMethod"),
      paymentStatus: searchParams.get("paymentStatus"),
    })

    return Response.json({ success: true, data: result })
  } catch (error) {
    console.error("Transaction list error:", error)

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
