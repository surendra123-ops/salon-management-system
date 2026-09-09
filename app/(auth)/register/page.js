"use client"

const React = require("react")
const { useState } = React

const RegisterPage = () => {
  const [salonName, setSalonName] = useState("")
  const [salonPhone, setSalonPhone] = useState("")
  const [salonAddress, setSalonAddress] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          salonName,
          salonPhone,
          salonAddress,
          name,
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error?.message || "Registration failed")
        setLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        window.location.href = "/login"
      }, 1500)
    } catch (err) {
      setError("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-primary mb-6 text-center">
          Create Your Account
        </h2>

        {success && (
          <div className="bg-accent-total-bg text-green-800 p-4 rounded mb-6">
            Registration successful! You can now log in.
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded mb-6">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-sm font-semibold text-secondary uppercase mb-3">
              Salon Details
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">
                  Salon Name
                </label>
                <input
                  value={salonName}
                  onChange={(e) => setSalonName(e.target.value)}
                  type="text"
                  placeholder="Enter salon name"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-button-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-1">
                  Salon Phone
                </label>
                <input
                  value={salonPhone}
                  onChange={(e) => setSalonPhone(e.target.value)}
                  type="tel"
                  placeholder="Enter salon phone"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-button-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-1">
                  Salon Address
                </label>
                <input
                  value={salonAddress}
                  onChange={(e) => setSalonAddress(e.target.value)}
                  type="text"
                  placeholder="Enter salon address"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-button-primary focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-sm font-semibold text-secondary uppercase mb-3">
              Your Details
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">
                  Full Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-button-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-1">
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
                <label className="block text-sm font-medium text-secondary mb-1">
                  Password
                </label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="At least 6 characters"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-button-primary focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-button-text bg-button-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-button-primary"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-secondary">
          Already have an account?{" "}
          <a href="/login" className="font-medium text-button-primary hover:opacity-80">
            Log in
          </a>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
