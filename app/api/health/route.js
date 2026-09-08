const { connectDB } = require("../../../lib/auth")

export async function GET() {
  try {
    await connectDB()
    const mongoose = require("mongoose")
    const state = mongoose.connection.readyState
    const states = { 0: "disconnected", 1: "connected", 2: "connecting", 3: "disconnecting" }

    return Response.json({
      success: true,
      data: {
        status: state === 1 ? "ok" : "unhealthy",
        database: states[state] || "unknown",
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    return Response.json({
      success: true,
      data: {
        status: "unhealthy",
        database: "disconnected",
        timestamp: new Date().toISOString(),
      },
    })
  }
}
