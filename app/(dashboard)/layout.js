import AuthGuard from "../../components/AuthGuard"
import AppNavWrapper from "../../components/AppNavWrapper"

export const metadata = {
  title: "Salon Management System",
}

export default function DashboardLayout({ children }) {
  return (
    <AuthGuard>
      <AppNavWrapper>{children}</AppNavWrapper>
    </AuthGuard>
  )
}
