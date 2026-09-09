"use client"

const React = require("react")
const { useState } = React

const LoginPage = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error?.message || "Login failed")
        setLoading(false)
        return
      }

      setSuccess(true)
      window.location.href = "/dashboard"
    } catch (err) {
      setError("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-primary mb-6 text-center">
          Salon Management System
        </h2>

        {success && (
          <div className="bg-accent-total-bg text-green-800 p-4 rounded mb-6">
            Login successful!
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded mb-6">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Enter your email"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-button-primary focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Password
            </label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Enter your password"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-button-primary focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-button-text bg-button-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-button-primary"
          >
            {loading
              ? "Logging in..."
              : <span>Login</span>}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-secondary">
          Don&apos;t have an account?{" "}
          <a href="/register" className="font-medium text-button-primary hover:opacity-80">
            Register
          </a>
        </p>
      </div>
    </div>
  )
}

export default LoginPage