const { connectDB } = require("../../../../lib/auth")
const authService = require("../../../../services/auth/authService")
const AppError = require("../../../../lib/errors/AppError")
const { registerSchema } = require("../../../../validations/auth")

export async function POST(request) {
  try {
    await connectDB()

    const body = await request.json()

    const validation = registerSchema.safeParse(body)
    if (!validation.success) {
      return Response.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: validation.error.errors[0].message } },
        { status: 422 }
      )
    }

    const result = await authService.register(validation.data)

    const cookieOptions = [
      `token=${result.token}`,
      "HttpOnly",
      "Path=/",
      "SameSite=Strict",
      `Max-Age=${7 * 24 * 60 * 60}`,
    ]
    if (process.env.NODE_ENV === "production") {
      cookieOptions.push("Secure")
    }

    return Response.json(
      { success: true, data: { user: result.user } },
      {
        status: 201,
        headers: {
          "Set-Cookie": cookieOptions.join("; "),
        },
      }
    )
  } catch (error) {
    console.error("Registration error:", error)

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
