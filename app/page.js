export default function Page() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Salon Management System
        </h1>

        <p className="text-gray-600 mb-8">
          Please log in to access the salon management dashboard.
        </p>

        <div className="space-y-4">
          <a
            href="/login"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Owner Login
          </a>
          <a
            href="/register"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Register Salon
          </a>
        </div>
      </div>
    </div>
  )
}
