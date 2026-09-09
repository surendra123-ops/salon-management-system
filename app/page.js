export default function Page() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-md p-8 text-center">
        <h1 className="text-3xl font-bold text-primary mb-6">
          Salon Management System
        </h1>

        <p className="text-secondary mb-8">
          Please log in to access the salon management dashboard.
        </p>

        <div className="space-y-4">
          <a
            href="/login"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-button-text bg-button-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-button-primary"
          >
            Owner Login
          </a>
          <a
            href="/register"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-primary bg-card hover:bg-background focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-button-primary"
          >
            Register Salon
          </a>
        </div>
      </div>
    </div>
  )
}
