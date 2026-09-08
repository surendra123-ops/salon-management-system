"use client"

import { useState, useEffect } from "react"

const AuthGuard = ({ children }) => {
  const [authChecked, setAuthChecked] = useState(false)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me")
        if (res.ok) {
          setAuthorized(true)
        } else {
          window.location.href = "/login"
          return
        }
      } catch {
        window.location.href = "/login"
        return
      }
      setAuthChecked(true)
    }
    checkAuth()
  }, [])

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!authorized) return null

  return children
}

export default AuthGuard
