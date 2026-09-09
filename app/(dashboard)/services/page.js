import { redirect } from "next/navigation"
import { connectDB } from "../../../lib/auth"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { env } from "../../../config/env"
import Service from "../../../models/Service"
import ServicesManager from "../../../components/services/ServicesManager"

export default async function ServicesPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  if (!token) {
    redirect("/login")
  }

  let payload
  try {
    await connectDB()
    payload = jwt.verify(token, env.SESSION_SECRET)
  } catch {
    redirect("/login")
  }

  const services = await Service.find({ salonId: payload.salonId })
    .sort({ name: 1 })
    .limit(200)
    .lean()

  const formattedServices = services.map((s) => ({
    id: s._id.toString(),
    salonId: s.salonId?.toString(),
    name: s.name,
    category: s.category,
    price: s.price,
    image: s.image || null,
    createdAt: s.createdAt?.toISOString(),
    updatedAt: s.updatedAt?.toISOString(),
  }))

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <ServicesManager initialServices={formattedServices} initialTotal={formattedServices.length} />
      </div>
    </div>
  )
}
