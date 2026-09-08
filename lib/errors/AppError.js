class AppError extends Error {
  constructor(message, statusCode, errorCode, details) {
    super(message)
    this.name = "AppError"
    this.statusCode = statusCode
    this.errorCode = errorCode
    this.details = details || null

    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = AppError