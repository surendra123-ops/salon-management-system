const { connectDB, verifyAuth, unauthorizedResponse } = require("../../../../lib/auth")
const transactionService = require("../../../../services/transactions/transactionService")
const AppError = require("../../../../lib/errors/AppError")

export async function GET(request, { params }) {
  try {
    await connectDB()

    const payload = verifyAuth(request)
    if (!payload) return unauthorizedResponse()

    const { id } = await params
    const result = await transactionService.getTransactionById(id, payload.salonId)
    return Response.json({ success: true, data: result })
  } catch (error) {
    console.error("Transaction detail error:", error)

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
