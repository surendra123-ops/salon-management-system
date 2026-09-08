const { verifyAuth, unauthorizedResponse } = require("../../../../lib/auth")

export async function GET(request) {
  const payload = verifyAuth(request)
  if (!payload) return unauthorizedResponse()

  return Response.json({
    success: true,
    data: {
      user: {
        id: payload.userId,
        salonId: payload.salonId,
        role: payload.role,
      },
    },
  })
}
