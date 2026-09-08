const mongoose = require("mongoose")

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function connect() {
  if (cached.conn) return cached.conn

  if (!cached.promise) {
    cached.promise = mongooseConnect()
      .then((mongoose) => {
        return mongoose
      })
      .catch((err) => {
        cached.promise = null
        throw err
      })
  }

  try {
    cached.conn = await cached.promise
    return cached.conn
  } catch (e) {
    cached.promise = null
    throw e
  }
}

function mongooseConnect() {
  const uri = require("../../config/env").env.MONGODB_URI
  const dbName = require("../../config/env").env.MONGODB_DB_NAME

  const opts = {
    dbName,
    bufferCommands: false,
  }

  return mongoose.connect(uri, opts)
}

module.exports = connect