import "./globals.css"

export const metadata = {
  title: "Salon Management System",
  description: "Salon Management Web Application",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  )
}
