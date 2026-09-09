import "./globals.css"
import { Space_Grotesk, Tangerine } from "next/font/google"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
})

const tangerine = Tangerine({
  weight: "700",
  subsets: ["latin"],
  variable: "--font-tangerine",
})

export const metadata = {
  title: "Look Salon - Management System",
  description: "Salon Management Web Application",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.className} ${tangerine.variable} antialiased bg-background min-h-screen`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
