const { z } = require("zod");

const envSchema = z.object({
  MONGODB_URI: z.string().describe("MongoDB connection URI"),
  MONGODB_DB_NAME: z.string().default("salon").describe("MongoDB database name"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  NEXT_PUBLIC_APP_NAME: z.string().default("Salon Management System"),
  SESSION_SECRET: z
    .string()
    .min(32, "Session secret must be at least 32 characters")
    .describe("Session signing secret"),
});

let _env = null;

function getEnv() {
  if (!_env) {
    _env = envSchema.parse(process.env);
  }
  return _env;
}

module.exports = {
  get env() {
    return getEnv();
  },
  isDevelopment: () => getEnv().NODE_ENV === "development",
  isProduction: () => getEnv().NODE_ENV === "production",
  isTest: () => getEnv().NODE_ENV === "test",
};