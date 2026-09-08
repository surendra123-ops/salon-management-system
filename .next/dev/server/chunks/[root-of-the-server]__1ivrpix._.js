module.exports = [
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/runtime-reacts.external.js [external] (next/dist/server/runtime-reacts.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/runtime-reacts.external.js", () => require("next/dist/server/runtime-reacts.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/node:stream [external] (node:stream, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[project]/app/api/auth/login/route.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
const { connectDB } = __turbopack_context__.r("[project]/lib/auth.js [app-route] (ecmascript)");
const authService = __turbopack_context__.r("[project]/services/auth/authService.js [app-route] (ecmascript)");
const AppError = __turbopack_context__.r("[project]/lib/errors/AppError.js [app-route] (ecmascript)");
const { loginSchema } = __turbopack_context__.r("[project]/validations/auth.js [app-route] (ecmascript)");
async function POST(request) {
    try {
        await connectDB();
        const body = await request.json();
        const validation = loginSchema.safeParse(body);
        if (!validation.success) {
            return Response.json({
                success: false,
                error: {
                    code: "VALIDATION_ERROR",
                    message: validation.error.errors[0].message
                }
            }, {
                status: 422
            });
        }
        const { email, password } = validation.data;
        const result = await authService.login(email, password);
        const cookieOptions = [
            `token=${result.token}`,
            "HttpOnly",
            "Path=/",
            "SameSite=Strict",
            `Max-Age=${7 * 24 * 60 * 60}`
        ];
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        return Response.json({
            success: true,
            data: {
                user: result.user
            }
        }, {
            status: 200,
            headers: {
                "Set-Cookie": cookieOptions.join("; ")
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        if (error instanceof AppError) {
            return Response.json({
                success: false,
                error: {
                    code: error.errorCode,
                    message: error.message
                }
            }, {
                status: error.statusCode
            });
        }
        return Response.json({
            success: false,
            error: {
                code: "INTERNAL_ERROR",
                message: "Something went wrong"
            }
        }, {
            status: 500
        });
    }
}
}),
"[project]/config/env.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

const { z } = __turbopack_context__.r("[project]/node_modules/zod/index.cjs [app-route] (ecmascript)");
const envSchema = z.object({
    MONGODB_URI: z.string().describe("MongoDB connection URI"),
    MONGODB_DB_NAME: z.string().default("salon").describe("MongoDB database name"),
    NODE_ENV: z.enum([
        "development",
        "production",
        "test"
    ]).default("development"),
    NEXT_PUBLIC_APP_NAME: z.string().default("Salon Management System"),
    SESSION_SECRET: z.string().min(32, "Session secret must be at least 32 characters").describe("Session signing secret")
});
let _env = null;
function getEnv() {
    if (!_env) {
        _env = envSchema.parse(process.env);
    }
    return _env;
}
module.exports = {
    get env () {
        return getEnv();
    },
    isDevelopment: ()=>getEnv().NODE_ENV === "development",
    isProduction: ()=>getEnv().NODE_ENV === "production",
    isTest: ()=>getEnv().NODE_ENV === "test"
};
}),
"[project]/lib/auth.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

const jwt = __turbopack_context__.r("[project]/node_modules/jsonwebtoken/index.js [app-route] (ecmascript)");
const connectDB = __turbopack_context__.r("[project]/lib/db/mongodb.js [app-route] (ecmascript)");
function parseCookies(request) {
    const cookieHeader = request.headers.get("cookie") || "";
    return Object.fromEntries(cookieHeader.split(";").map((c)=>{
        const [key, ...rest] = c.trim().split("=");
        return [
            key,
            rest.join("=")
        ];
    }));
}
function verifyAuth(request) {
    const { env } = __turbopack_context__.r("[project]/config/env.js [app-route] (ecmascript)");
    const cookies = parseCookies(request);
    const token = cookies.token;
    if (!token) return null;
    try {
        return jwt.verify(token, env.SESSION_SECRET);
    } catch (e) {
        return null;
    }
}
function unauthorizedResponse() {
    return Response.json({
        success: false,
        error: {
            code: "UNAUTHORIZED",
            message: "Authentication required"
        }
    }, {
        status: 401
    });
}
module.exports = {
    parseCookies,
    verifyAuth,
    unauthorizedResponse,
    connectDB
};
}),
"[project]/lib/db/mongodb.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

const mongoose = __turbopack_context__.r("[externals]/mongoose [external] (mongoose, cjs, [project]/node_modules/mongoose)");
let cached = /*TURBOPACK member replacement*/ __turbopack_context__.g.mongoose;
if (!cached) {
    cached = /*TURBOPACK member replacement*/ __turbopack_context__.g.mongoose = {
        conn: null,
        promise: null
    };
}
async function connect() {
    if (cached.conn) return cached.conn;
    if (!cached.promise) {
        cached.promise = mongooseConnect().then((mongoose)=>{
            return mongoose;
        }).catch((err)=>{
            cached.promise = null;
            throw err;
        });
    }
    try {
        cached.conn = await cached.promise;
        return cached.conn;
    } catch (e) {
        cached.promise = null;
        throw e;
    }
}
function mongooseConnect() {
    const uri = __turbopack_context__.r("[project]/config/env.js [app-route] (ecmascript)").env.MONGODB_URI;
    const dbName = __turbopack_context__.r("[project]/config/env.js [app-route] (ecmascript)").env.MONGODB_DB_NAME;
    const opts = {
        dbName,
        bufferCommands: false
    };
    return mongoose.connect(uri, opts);
}
module.exports = connect;
}),
"[project]/lib/errors/AppError.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

class AppError extends Error {
    constructor(message, statusCode, errorCode, details){
        super(message);
        this.name = "AppError";
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.details = details || null;
        Error.captureStackTrace(this, this.constructor);
    }
}
module.exports = AppError;
}),
"[project]/models/Salon.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

const mongoose = __turbopack_context__.r("[externals]/mongoose [external] (mongoose, cjs, [project]/node_modules/mongoose)");
const { Schema } = mongoose;
const salonSchema = new Schema({
    name: {
        type: String,
        required: [
            true,
            "Salon name is required"
        ],
        trim: true,
        maxlength: [
            100,
            "Salon name cannot exceed 100 characters"
        ]
    },
    phone: {
        type: String,
        required: [
            true,
            "Salon phone is required"
        ],
        trim: true
    },
    address: {
        type: String,
        required: [
            true,
            "Salon address is required"
        ],
        trim: true
    },
    currency: {
        type: String,
        default: "INR"
    },
    timezone: {
        type: String,
        default: "Asia/Kolkata"
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});
// Index for faster queries
salonSchema.index({
    name: 1
});
module.exports = mongoose.models.Salon || mongoose.model("Salon", salonSchema);
}),
"[project]/models/User.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

const mongoose = __turbopack_context__.r("[externals]/mongoose [external] (mongoose, cjs, [project]/node_modules/mongoose)");
const bcrypt = __turbopack_context__.r("[project]/node_modules/bcryptjs/index.js [app-route] (ecmascript)");
const { Schema } = mongoose;
const userSchema = new Schema({
    salonId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Salon"
    },
    name: {
        type: String,
        required: [
            true,
            "User name is required"
        ],
        trim: true
    },
    email: {
        type: String,
        required: [
            true,
            "User email is required"
        ],
        unique: true,
        lowercase: true,
        trim: true,
        maxlength: [
            100,
            "Email cannot exceed 100 characters"
        ]
    },
    phone: {
        type: String,
        trim: true,
        lowercase: true
    },
    passwordHash: {
        type: String,
        required: [
            true,
            "Password hash is required"
        ]
    },
    role: {
        type: String,
        enum: [
            "owner"
        ],
        default: "owner"
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLoginAt: {
        type: Date
    }
}, {
    timestamps: true
});
// Index for tenant isolation and email lookup
userSchema.index({
    salonId: 1,
    email: 1
}, {
    unique: true
});
// Hash password before saving
userSchema.pre("save", async function(next) {
    if (!this.isModified("passwordHash")) return next();
    const saltRounds = 12;
    this.passwordHash = await bcrypt.hash(this.passwordHash, saltRounds);
    next();
});
// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.passwordHash);
};
// Set toJSON transform to exclude passwordHash
userSchema.set("toJSON", {
    transform: (doc, ret)=>{
        delete ret.passwordHash;
        return {
            id: doc._id,
            salonId: doc.salonId,
            name: doc.name,
            email: doc.email,
            role: doc.role
        };
    }
});
module.exports = mongoose.models.User || mongoose.model("User", userSchema);
}),
"[project]/services/auth/authService.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

const User = __turbopack_context__.r("[project]/models/User.js [app-route] (ecmascript)");
const AppError = __turbopack_context__.r("[project]/lib/errors/AppError.js [app-route] (ecmascript)");
const jwt = __turbopack_context__.r("[project]/node_modules/jsonwebtoken/index.js [app-route] (ecmascript)");
/**
 * Login user and create session
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Object} - Token and user data
 */ const login = async (email, password)=>{
    // Find user by email (includes salonId)
    const user = await User.findOne({
        email
    }).select("+passwordHash");
    if (!user) {
        throw new AppError("Invalid email or password", 401, "AUTH_INVALID_CREDENTIALS");
    }
    if (!user.isActive) {
        throw new AppError("Account is disabled", 401, "AUTH_ACCOUNT_DISABLED");
    }
    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new AppError("Invalid email or password", 401, "AUTH_INVALID_CREDENTIALS");
    }
    // Create JWT payload (exclude passwordHash)
    const payload = {
        userId: user._id,
        salonId: user.salonId,
        role: user.role
    };
    // Sign token
    const token = jwt.sign(payload, __turbopack_context__.r("[project]/config/env.js [app-route] (ecmascript)").env.SESSION_SECRET, {
        expiresIn: "7d"
    });
    return {
        token,
        user: user.toJSON()
    };
};
/**
 * Register a new salon owner (creates Salon + User)
 * @param {Object} data - Registration data
 * @returns {Object} - Token and user data
 */ const register = async ({ salonName, salonPhone, salonAddress, name, email, password })=>{
    const Salon = __turbopack_context__.r("[project]/models/Salon.js [app-route] (ecmascript)");
    const User = __turbopack_context__.r("[project]/models/User.js [app-route] (ecmascript)");
    // Check if email already taken
    const existingUser = await User.findOne({
        email
    });
    if (existingUser) {
        throw new AppError("Email already registered", 409, "AUTH_EMAIL_EXISTS");
    }
    // Create salon
    const salon = await Salon.create({
        name: salonName,
        phone: salonPhone,
        address: salonAddress
    });
    // Create user linked to salon
    const user = await User.create({
        salonId: salon._id,
        name,
        email,
        passwordHash: password,
        role: "owner"
    });
    // Sign token
    const payload = {
        userId: user._id,
        salonId: salon._id,
        role: user.role
    };
    const token = jwt.sign(payload, __turbopack_context__.r("[project]/config/env.js [app-route] (ecmascript)").env.SESSION_SECRET, {
        expiresIn: "7d"
    });
    return {
        token,
        user: user.toJSON()
    };
};
/**
 * Get current authenticated user
 * @param {Object} payload - JWT payload
 * @returns {Object} - Safe user data
 */ const getCurrentUser = (payload)=>{
    if (!payload || !payload.userId) {
        throw new AppError("Unauthorized", 401, "AUTH_UNAUTHORIZED");
    }
    // In a real app, you'd fetch the user from DB
    // For now, return the payload data (safe fields only)
    return {
        id: payload.userId,
        salonId: payload.salonId,
        role: payload.role
    };
};
/**
 * Logout user (invalidate session)
 * @param {string} token - JWT token to invalidate
 */ const logout = async (token)=>{
    // In a cookie-based approach, we just clear the cookie
    // The server-side session can be invalidated in Redis, but for Phase 1
    // we rely on the cookie expiry
    return {
        success: true
    };
};
module.exports = {
    login,
    register,
    getCurrentUser,
    logout
};
}),
"[project]/validations/auth.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

const { z } = __turbopack_context__.r("[project]/node_modules/zod/index.cjs [app-route] (ecmascript)");
const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address").trim().toLowerCase(),
    password: z.string().min(1, "Password is required").regex(/^.{6,}$/, "Password must be at least 6 characters")
});
const registerSchema = z.object({
    salonName: z.string().min(1, "Salon name is required").max(100, "Salon name cannot exceed 100 characters").trim(),
    salonPhone: z.string().min(1, "Salon phone is required").trim(),
    salonAddress: z.string().min(1, "Salon address is required").trim(),
    name: z.string().min(1, "Your name is required").max(100, "Name cannot exceed 100 characters").trim(),
    email: z.string().email("Please enter a valid email address").trim().toLowerCase(),
    password: z.string().min(1, "Password is required").regex(/^.{6,}$/, "Password must be at least 6 characters")
});
module.exports = {
    loginSchema,
    registerSchema
};
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1ivrpix._.js.map