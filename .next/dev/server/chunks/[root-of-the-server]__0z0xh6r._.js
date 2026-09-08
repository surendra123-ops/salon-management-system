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
"[project]/app/api/transactions/route.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
const { connectDB, verifyAuth, unauthorizedResponse } = __turbopack_context__.r("[project]/lib/auth.js [app-route] (ecmascript)");
const transactionService = __turbopack_context__.r("[project]/services/transactions/transactionService.js [app-route] (ecmascript)");
const AppError = __turbopack_context__.r("[project]/lib/errors/AppError.js [app-route] (ecmascript)");
async function POST(request) {
    try {
        await connectDB();
        const payload = verifyAuth(request);
        if (!payload) return unauthorizedResponse();
        if (payload.role !== "owner") {
            return Response.json({
                success: false,
                error: {
                    code: "FORBIDDEN",
                    message: "You don't have permission to access this resource"
                }
            }, {
                status: 403
            });
        }
        const body = await request.json();
        const result = await transactionService.createTransaction({
            services: body.services,
            discount: body.discount,
            paymentMethod: body.paymentMethod,
            paymentStatus: body.paymentStatus,
            amountPaid: body.amountPaid,
            notes: body.notes,
            salonId: payload.salonId,
            createdBy: payload.userId
        });
        return Response.json({
            success: true,
            data: result
        }, {
            status: 201
        });
    } catch (error) {
        console.error("Transaction creation error:", error);
        if (error instanceof AppError) {
            return Response.json({
                success: false,
                error: {
                    code: error.errorCode,
                    message: error.message,
                    details: error.details
                }
            }, {
                status: error.statusCode
            });
        }
        if (error.name === "ValidationError") {
            const errors = {};
            for (const [key, val] of Object.entries(error.errors)){
                errors[key] = val.message;
            }
            return Response.json({
                success: false,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Validation failed",
                    details: errors
                }
            }, {
                status: 422
            });
        }
        if (error.code === 11000) {
            return Response.json({
                success: false,
                error: {
                    code: "DUPLICATE_KEY",
                    message: "A record with this value already exists"
                }
            }, {
                status: 409
            });
        }
        if (error.name === "CastError") {
            return Response.json({
                success: false,
                error: {
                    code: "INVALID_ID",
                    message: "Invalid identifier format"
                }
            }, {
                status: 400
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
async function GET(request) {
    try {
        await connectDB();
        const payload = verifyAuth(request);
        if (!payload) return unauthorizedResponse();
        const { searchParams } = new URL(request.url);
        const result = await transactionService.listTransactions({
            salonId: payload.salonId,
            page: searchParams.get("page"),
            limit: searchParams.get("limit"),
            search: searchParams.get("search"),
            from: searchParams.get("from"),
            to: searchParams.get("to"),
            paymentMethod: searchParams.get("paymentMethod"),
            paymentStatus: searchParams.get("paymentStatus")
        });
        return Response.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error("Transaction list error:", error);
        if (error instanceof AppError) {
            return Response.json({
                success: false,
                error: {
                    code: error.errorCode,
                    message: error.message,
                    details: error.details
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
"[project]/lib/calculations/transaction.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

const AppError = __turbopack_context__.r("[project]/lib/errors/AppError.js [app-route] (ecmascript)");
/**
 * Transaction calculation utilities
 * All monetary values are in integer rupees (₹499 = 499, not 49900 paise)
 * Rounding policy: Math.floor for percentage discounts to avoid fractional currency
 * This policy is applied consistently server-side and must not be duplicated on frontend
 */ /**
 * Calculate subtotal from services array
 * subtotal = SUM(service.price × service.quantity)
 * @param {Array} services - Array of { price, quantity }
 * @returns {Number} - Subtotal in rupees
 */ const calculateSubtotal = (services)=>{
    if (!Array.isArray(services) || services.length === 0) {
        return 0;
    }
    return services.reduce((sum, service)=>{
        const lineTotal = (service.price || 0) * (service.quantity || 1);
        return sum + lineTotal;
    }, 0);
};
/**
 * Calculate discount amount based on discount config and subtotal
 * Validates discount rules and applies consistent rounding
 * @param {Object} discount - { type: "fixed" | "percentage", value: Number }
 * @param {Number} subtotal - Subtotal in rupees
 * @returns {Object} - { type, value, amount: Number }
 */ const calculateDiscount = (discount, subtotal)=>{
    const { type, value } = discount;
    if (!type) {
        throw new AppError("Discount type is required", 400, "INVALID_DISCOUNT");
    }
    if (value === undefined || value === null || value < 0) {
        throw new AppError("Discount value must be at least 0", 400, "INVALID_DISCOUNT");
    }
    let amount;
    if (type === "fixed") {
        if (value > subtotal) {
            throw new AppError("Fixed discount cannot exceed subtotal", 400, "INVALID_DISCOUNT");
        }
        amount = Math.floor(value);
    } else if (type === "percentage") {
        if (value > 100) {
            throw new AppError("Percentage discount cannot exceed 100%", 400, "INVALID_DISCOUNT");
        }
        amount = Math.floor(subtotal * value / 100);
    } else {
        throw new AppError("Invalid discount type", 400, "INVALID_DISCOUNT");
    }
    return {
        type,
        value: Number(value),
        amount: Number(amount)
    };
};
/**
 * Calculate final amount after discount
 * finalAmount = subtotal - discount amount
 * @param {Number} subtotal - Subtotal in rupees
 * @param {Object} discount - { type, value, amount } from calculateDiscount
 * @returns {Number} - Final amount in rupees
 */ const calculateFinalAmount = (subtotal, discount)=>{
    const discountAmount = discount.amount || 0;
    const finalAmount = subtotal - discountAmount;
    return Math.max(0, finalAmount);
};
/**
 * Calculate amount due based on payment status and amount paid
 * @param {Number} finalAmount - Final amount in rupees
 * @param {Number} amountPaidInput - Amount paid in rupees (can be 0)
 * @param {String} paymentStatus - "paid" | "partial" | "pending"
 * @returns {Object} - { amountPaid, amountDue, paymentStatus }
 */ const calculateAmountDue = (finalAmount, amountPaidInput, paymentStatus)=>{
    let amountPaidCalculated = amountPaidInput || 0;
    let amountDueCalculated = finalAmount - amountPaidCalculated;
    let paymentStatusCalculated = paymentStatus;
    if (paymentStatusCalculated === "paid") {
        amountPaidCalculated = finalAmount;
        amountDueCalculated = 0;
        paymentStatusCalculated = "paid";
    } else if (paymentStatusCalculated === "pending") {
        amountPaidCalculated = 0;
        amountDueCalculated = finalAmount;
        paymentStatusCalculated = "pending";
    } else if (paymentStatusCalculated === "partial") {
        if (amountPaidCalculated >= finalAmount) {
            amountPaidCalculated = finalAmount;
            amountDueCalculated = 0;
            paymentStatusCalculated = "paid";
        } else if (amountPaidCalculated <= 0) {
            amountPaidCalculated = 0;
            amountDueCalculated = finalAmount;
            paymentStatusCalculated = "pending";
        } else {
            amountDueCalculated = finalAmount - amountPaidCalculated;
        }
    } else {
        amountPaidCalculated = finalAmount;
        amountDueCalculated = 0;
        paymentStatusCalculated = "paid";
    }
    return {
        amountPaid: Number(amountPaidCalculated),
        amountDue: Number(amountDueCalculated),
        paymentStatus: paymentStatusCalculated
    };
};
/**
 * Validate discount configuration before calculation
 * @param {Object} discount - { type, value }
 * @param {Number} subtotal - Subtotal in rupees
 * @returns {Boolean} - True if valid
 */ const validateDiscount = (discount, subtotal)=>{
    const { type, value } = discount;
    if (!type) {
        throw new AppError("Discount type is required", 400, "INVALID_DISCOUNT");
    }
    if (value === undefined || value === null) {
        throw new AppError("Discount value is required", 400, "INVALID_DISCOUNT");
    }
    if (value < 0) {
        throw new AppError("Discount value must be at least 0", 400, "INVALID_DISCOUNT");
    }
    if (type === "fixed" && value > subtotal) {
        throw new AppError("Fixed discount cannot exceed subtotal", 400, "INVALID_DISCOUNT");
    }
    if (type === "percentage" && value > 100) {
        throw new AppError("Percentage discount cannot exceed 100%", 400, "INVALID_DISCOUNT");
    }
    return true;
};
/**
 * Full validation for transaction creation
 * @param {Object} payload - Transaction creation payload
 * @returns {Object} - { valid: true, subtotal, discount, finalAmount, amountPaid, amountDue, paymentStatus }
 */ const validateTransactionCreation = async (payload)=>{
    const { services, discount, paymentStatus, amountPaid: amountPaidInput } = payload;
    if (!Array.isArray(services) || services.length === 0) {
        throw new AppError("At least one service is required", 400, "TRANSACTION_VALIDATION_ERROR");
    }
    const subtotal = calculateSubtotal(services);
    let discountCalculated = {
        type: "fixed",
        value: 0,
        amount: 0
    };
    if (discount) {
        validateDiscount(discount, subtotal);
        discountCalculated = calculateDiscount(discount, subtotal);
    }
    const finalAmount = ("TURBOPACK compile-time truthy", 1) ? calculateFinalAmount(subtotal, discountCalculated) : "TURBOPACK unreachable";
    const paymentValidation = calculateAmountDue(finalAmount, amountPaidInput, paymentStatus);
    const resolvedAmountPaid = paymentValidation.amountPaid;
    const resolvedAmountDue = paymentValidation.amountDue;
    const resolvedPaymentStatus = paymentValidation.paymentStatus;
    if (resolvedAmountPaid < 0) {
        throw new AppError("Amount paid must be at least 0", 400, "INVALID_PAYMENT");
    }
    if (resolvedAmountPaid > finalAmount && resolvedPaymentStatus !== "paid") {
        throw new AppError("Amount paid exceeds final amount", 400, "INVALID_PAYMENT");
    }
    if (resolvedPaymentStatus === "paid" && resolvedAmountPaid !== finalAmount) {
        throw new AppError("Payment status must match amount paid", 400, "INVALID_PAYMENT");
    }
    if (resolvedPaymentStatus === "pending" && resolvedAmountPaid !== 0) {
        throw new AppError("Pending payment must have amount paid of 0", 400, "INVALID_PAYMENT");
    }
    if (resolvedPaymentStatus === "partial" && (resolvedAmountPaid <= 0 || resolvedAmountPaid >= finalAmount)) {
        throw new AppError("Partial payment must have amount paid greater than 0 and less than final amount", 400, "INVALID_PAYMENT");
    }
    return {
        valid: true,
        subtotal,
        discount: discountCalculated,
        finalAmount,
        amountPaid: resolvedAmountPaid,
        amountDue: resolvedAmountDue,
        paymentStatus: resolvedPaymentStatus
    };
};
module.exports = {
    calculateSubtotal,
    calculateDiscount,
    calculateFinalAmount,
    calculateAmountDue,
    validateDiscount,
    validateTransactionCreation,
    calculateLineTotal: (price, quantity)=>Math.max(0, (price || 0) * (quantity || 1))
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
"[project]/models/Counter.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

const mongoose = __turbopack_context__.r("[externals]/mongoose [external] (mongoose, cjs, [project]/node_modules/mongoose)");
const { Schema } = mongoose;
const counterSchema = new Schema({
    _id: {
        type: String,
        required: true
    },
    seq: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});
module.exports = mongoose.models.Counter || mongoose.model("Counter", counterSchema);
}),
"[project]/models/Service.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

const mongoose = __turbopack_context__.r("[externals]/mongoose [external] (mongoose, cjs, [project]/node_modules/mongoose)");
const { Schema } = mongoose;
const serviceSchema = new Schema({
    salonId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Salon"
    },
    name: {
        type: String,
        required: [
            true,
            "Service name is required"
        ],
        trim: true,
        maxlength: [
            100,
            "Service name cannot exceed 100 characters"
        ]
    },
    category: {
        type: String,
        default: "",
        trim: true
    },
    price: {
        type: Number,
        required: [
            true,
            "Service price is required"
        ],
        min: [
            0,
            "Price must be at least 0"
        ]
    },
    image: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});
serviceSchema.index({
    salonId: 1,
    category: 1
});
module.exports = mongoose.models.Service || mongoose.model("Service", serviceSchema);
}),
"[project]/models/Transaction.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

const mongoose = __turbopack_context__.r("[externals]/mongoose [external] (mongoose, cjs, [project]/node_modules/mongoose)");
const { Schema } = mongoose;
const transactionSchema = new Schema({
    salonId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Salon"
    },
    transactionNumber: {
        type: String,
        required: true,
        unique: true
    },
    services: [
        {
            serviceId: {
                type: Schema.Types.ObjectId,
                required: true,
                ref: "Service"
            },
            serviceName: {
                type: String,
                required: true,
                trim: true
            },
            price: {
                type: Number,
                required: true,
                min: [
                    0,
                    "Service price must be at least 0"
                ]
            },
            quantity: {
                type: Number,
                required: true,
                min: [
                    1,
                    "Quantity must be at least 1"
                ]
            },
            total: {
                type: Number,
                required: true,
                min: [
                    0,
                    "Line total must be at least 0"
                ]
            }
        }
    ],
    subtotal: {
        type: Number,
        required: true,
        min: [
            0,
            "Subtotal must be at least 0"
        ]
    },
    discount: {
        type: {
            type: String,
            enum: [
                "fixed",
                "percentage"
            ],
            required: true
        },
        value: {
            type: Number,
            required: true,
            min: [
                0,
                "Discount value must be at least 0"
            ]
        },
        amount: {
            type: Number,
            required: true,
            min: [
                0,
                "Discount amount must be at least 0"
            ]
        }
    },
    finalAmount: {
        type: Number,
        required: true,
        min: [
            0,
            "Final amount must be at least 0"
        ]
    },
    paymentMethod: {
        type: String,
        enum: [
            "cash",
            "upi",
            "card",
            "other"
        ],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: [
            "paid",
            "partial",
            "pending"
        ],
        default: "paid"
    },
    amountPaid: {
        type: Number,
        required: true,
        default: 0,
        min: [
            0,
            "Amount paid must be at least 0"
        ]
    },
    amountDue: {
        type: Number,
        required: true,
        default: 0,
        min: [
            0,
            "Amount due must be at least 0"
        ]
    },
    notes: {
        type: String,
        trim: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, {
    timestamps: true
});
transactionSchema.index({
    salonId: 1,
    createdAt: -1
});
transactionSchema.index({
    salonId: 1,
    transactionNumber: 1
}, {
    unique: true
});
module.exports = mongoose.models.Transaction || mongoose.model("Transaction", transactionSchema);
}),
"[project]/services/transactions/transactionService.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

const Transaction = __turbopack_context__.r("[project]/models/Transaction.js [app-route] (ecmascript)");
const Service = __turbopack_context__.r("[project]/models/Service.js [app-route] (ecmascript)");
const Counter = __turbopack_context__.r("[project]/models/Counter.js [app-route] (ecmascript)");
const AppError = __turbopack_context__.r("[project]/lib/errors/AppError.js [app-route] (ecmascript)");
const { validateTransactionCreation } = __turbopack_context__.r("[project]/lib/calculations/transaction.js [app-route] (ecmascript)");
const generateTransactionNumber = async (salonId)=>{
    const dateStr = new Date().toLocaleString("en-CA", {
        timeZone: "Asia/Kolkata"
    }).split("T")[0].replace(/-/g, "");
    const counterId = `txn_${salonId}_${dateStr}`;
    const counter = await Counter.findOneAndUpdate({
        _id: counterId
    }, {
        $inc: {
            seq: 1
        }
    }, {
        new: true,
        upsert: true
    });
    const sequence = counter.seq.toString().padStart(4, "0");
    return `TXN-${dateStr}-${sequence}`;
};
const createTransaction = async (payload)=>{
    const { services, discount, paymentMethod, paymentStatus, amountPaid, notes, salonId, createdBy } = payload;
    if (!Array.isArray(services) || services.length === 0) {
        throw new AppError("At least one service is required", 400, "TRANSACTION_VALIDATION_ERROR");
    }
    if (!paymentMethod) {
        throw new AppError("Payment method is required", 400, "TRANSACTION_VALIDATION_ERROR");
    }
    const transactionServices = [];
    let subtotal = 0;
    for (const svc of services){
        const { serviceId, quantity } = svc;
        if (!serviceId) {
            throw new AppError("Service ID is required for each service", 400, "TRANSACTION_VALIDATION_ERROR");
        }
        const qty = Number(quantity) || 1;
        if (qty < 1) {
            throw new AppError("Quantity must be at least 1", 400, "TRANSACTION_VALIDATION_ERROR");
        }
        const service = await Service.findOne({
            _id: serviceId,
            salonId
        });
        if (!service) {
            throw new AppError("Service not found", 404, "SERVICE_NOT_FOUND");
        }
        const price = service.price;
        const total = price * qty;
        subtotal += total;
        transactionServices.push({
            serviceId: service._id,
            serviceName: service.name,
            price,
            quantity: qty,
            total
        });
    }
    const validation = await validateTransactionCreation({
        services: transactionServices.map((s)=>({
                price: s.price,
                quantity: s.quantity
            })),
        discount,
        paymentMethod,
        paymentStatus,
        amountPaid
    });
    const transactionNumber = await generateTransactionNumber(salonId);
    const transaction = new Transaction({
        salonId,
        transactionNumber,
        services: transactionServices,
        subtotal: validation.subtotal,
        discount: validation.discount,
        finalAmount: validation.finalAmount,
        paymentMethod,
        paymentStatus: validation.paymentStatus,
        amountPaid: validation.amountPaid,
        amountDue: validation.amountDue,
        notes: notes ? notes.trim() : undefined,
        createdBy,
        updatedBy: createdBy
    });
    await transaction.save();
    return formatTransactionResponse(transaction);
};
const listTransactions = async (params)=>{
    const { salonId, page = 1, limit = 20, search, from, to, paymentMethod, paymentStatus } = params;
    const pageNum = Math.max(1, Math.floor(page));
    const limitNum = Math.min(Math.max(1, limit), 100);
    const filter = {
        salonId
    };
    if (search && search.trim()) {
        filter.transactionNumber = {
            $regex: new RegExp(search.trim(), "i")
        };
    }
    if (from || to) {
        filter.createdAt = {};
        if (from) {
            filter.createdAt.$gte = new Date(from + "T00:00:00+05:30");
        }
        if (to) {
            filter.createdAt.$lte = new Date(to + "T23:59:59.999+05:30");
        }
    }
    if (paymentMethod) {
        filter.paymentMethod = paymentMethod;
    }
    if (paymentStatus) {
        filter.paymentStatus = paymentStatus;
    }
    const total = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter).sort({
        createdAt: -1
    }).skip((pageNum - 1) * limitNum).limit(limitNum).lean();
    const safeTransactions = transactions.map((t)=>formatTransactionResponse(t, false));
    return {
        transactions: safeTransactions,
        pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum) || 1
        }
    };
};
const getTransactionById = async (id, salonId)=>{
    const transaction = await Transaction.findOne({
        _id: id,
        salonId
    }).lean();
    if (!transaction) {
        throw new AppError("Transaction not found", 404, "TRANSACTION_NOT_FOUND");
    }
    return formatTransactionResponse(transaction, true);
};
const formatTransactionResponse = (transaction, includeDetails = false)=>{
    const base = {
        id: transaction._id || transaction.id,
        salonId: transaction.salonId,
        transactionNumber: transaction.transactionNumber,
        subtotal: transaction.subtotal,
        discount: transaction.discount,
        finalAmount: transaction.finalAmount,
        paymentMethod: transaction.paymentMethod,
        paymentStatus: transaction.paymentStatus,
        amountPaid: transaction.amountPaid,
        amountDue: transaction.amountDue,
        notes: transaction.notes,
        createdBy: transaction.createdBy,
        updatedBy: transaction.updatedBy,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt
    };
    if (includeDetails) {
        base.services = transaction.services.map((s)=>({
                serviceId: s.serviceId,
                serviceName: s.serviceName,
                price: s.price,
                quantity: s.quantity,
                total: s.total
            }));
    } else {
        base.services = transaction.services.map((s)=>s.serviceName);
    }
    return base;
};
module.exports = {
    createTransaction,
    listTransactions,
    getTransactionById,
    generateTransactionNumber
};
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0z0xh6r._.js.map