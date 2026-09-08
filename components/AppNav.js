"use client"

const AppNav = ({ current }) => {
  const links = [
    { href: "/dashboard", label: "Dashboard", key: "dashboard" },
    { href: "/services", label: "Services", key: "services" },
    { href: "/transactions", label: "Transactions", key: "transactions" },
  ]

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    window.location.href = "/login"
  }

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1">
          {links.map((link) => (
            <a
              key={link.key}
              href={link.href}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                current === link.key
                  ? "bg-primary-600 text-white"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>
        <button
          onClick={handleLogout}
          className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-gray-100"
        >
          Logout
        </button>
      </div>
    </nav>
  )
}

export default AppNav
