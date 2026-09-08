import { redirect } from "next/navigation"
import { connectDB } from "../../../../lib/auth"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { env } from "../../../../config/env"
import Service from "../../../../models/Service"
import TransactionForm from "../../../../components/transactions/TransactionForm"

export default async function NewTransactionPage() {
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

  const services = await Service.find({
    salonId: payload.salonId,
  })
    .sort({ name: 1 })
    .limit(100)
    .lean()

  const formattedServices = services.map((s) => ({
    id: s._id.toString(),
    name: s.name,
    category: s.category,
    price: s.price,
    image: s.image || null,
  }))

  return <TransactionForm initialServices={formattedServices} />
}
