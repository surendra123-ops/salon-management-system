"use client"

import { usePathname } from "next/navigation"
import AppNav from "./AppNav"

const routeToNav = {
  "/dashboard": "dashboard",
  "/transactions": "transactions",
  "/services": "services",
}

const AppNavWrapper = ({ children }) => {
  const pathname = usePathname()
  const currentKey =
    routeToNav[pathname] ||
    Object.entries(routeToNav).find(([prefix]) => pathname.startsWith(prefix + "/"))?.[1] ||
    "dashboard"

  return (
    <div className="min-h-screen bg-background">
      <AppNav current={currentKey} />
      <main>{children}</main>
    </div>
  )
}

export default AppNavWrapper
