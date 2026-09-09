import { Suspense } from "react"
import { redirect } from "next/navigation"
import { connectDB, verifyAuth } from "../../../lib/auth"
import { getDashboardData } from "../../../lib/dashboard"
import DashboardContent from "../../../components/dashboard/DashboardContent"

export default async function DashboardPage({ searchParams }) {
  await connectDB()

  const params = await searchParams
  const range = params?.range || "today"

  // Get salonId from JWT
  const { cookies } = require("next/headers")
  const jwt = require("jsonwebtoken")
  const { env } = require("../../../config/env")

  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value
  if (!token) {
    redirect("/login")
  }

  let payload
  try {
    payload = jwt.verify(token, env.SESSION_SECRET)
  } catch {
    redirect("/login")
  }

  if (payload.role !== "owner") {
    redirect("/login")
  }

  const data = await getDashboardData(payload.salonId, range)

  const hasData = (data.summary.transactions || 0) > 0

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="bg-card rounded-lg shadow-xl p-6 mb-6">
        <h1 className="text-3xl font-bold text-primary">Welcome, Owner</h1>
        <p className="text-secondary mt-1">Here&apos;s how your salon is performing.</p>
      </div>

      <DashboardContent initialData={data} hasData={hasData} />
    </div>
  )
}
