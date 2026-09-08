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
"[project]/app/api/reports/dashboard/route.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
const { connectDB, verifyAuth, unauthorizedResponse } = __turbopack_context__.r("[project]/lib/auth.js [app-route] (ecmascript)");
const AppError = __turbopack_context__.r("[project]/lib/errors/AppError.js [app-route] (ecmascript)");
const { resolveDateRange } = __turbopack_context__.r("[project]/lib/dates/timezone.js [app-route] (ecmascript)");
const Transaction = __turbopack_context__.r("[project]/models/Transaction.js [app-route] (ecmascript)");
const matchStage = (salonId, fromISO, toISO)=>({
        $match: {
            salonId,
            createdAt: {
                $gte: fromISO,
                $lt: toISO
            }
        }
    });
const getSummary = async (salonId, fromISO, toISO)=>{
    const pipeline = [
        matchStage(salonId, fromISO, toISO),
        {
            $group: {
                _id: null,
                grossSales: {
                    $sum: "$subtotal"
                },
                discounts: {
                    $sum: "$discount.amount"
                },
                netSales: {
                    $sum: "$finalAmount"
                },
                amountCollected: {
                    $sum: "$amountPaid"
                },
                amountDue: {
                    $sum: "$amountDue"
                },
                transactions: {
                    $sum: 1
                }
            }
        },
        {
            $project: {
                _id: 0,
                grossSales: 1,
                discounts: 1,
                netSales: 1,
                amountCollected: 1,
                amountDue: 1,
                transactions: 1
            }
        }
    ];
    const [result] = await Transaction.aggregate(pipeline);
    if (!result) {
        return {
            grossSales: 0,
            discounts: 0,
            netSales: 0,
            amountCollected: 0,
            amountDue: 0,
            transactions: 0,
            averageBill: 0
        };
    }
    const transactions = result.transactions || 0;
    return {
        ...result,
        averageBill: transactions > 0 ? Number((result.netSales / transactions).toFixed(2)) : 0
    };
};
const getTopServices = async (salonId, fromISO, toISO, limit = 5)=>{
    return Transaction.aggregate([
        matchStage(salonId, fromISO, toISO),
        {
            $unwind: "$services"
        },
        {
            $group: {
                _id: "$services.serviceId",
                serviceName: {
                    $first: "$services.serviceName"
                },
                quantity: {
                    $sum: "$services.quantity"
                },
                revenue: {
                    $sum: "$services.total"
                }
            }
        },
        {
            $sort: {
                revenue: -1
            }
        },
        {
            $limit: limit
        },
        {
            $project: {
                _id: 0,
                serviceId: "$_id",
                serviceName: 1,
                quantity: 1,
                revenue: 1
            }
        }
    ]);
};
const getPaymentSummary = async (salonId, fromISO, toISO)=>{
    const rows = await Transaction.aggregate([
        matchStage(salonId, fromISO, toISO),
        {
            $group: {
                _id: "$paymentMethod",
                amount: {
                    $sum: "$amountPaid"
                },
                count: {
                    $sum: 1
                }
            }
        },
        {
            $sort: {
                amount: -1
            }
        },
        {
            $project: {
                _id: 0,
                method: "$_id",
                amount: 1,
                count: 1
            }
        }
    ]);
    const total = rows.reduce((sum, row)=>sum + row.amount, 0);
    const knownMethods = [
        "cash",
        "upi",
        "card",
        "other"
    ];
    const methodMap = new Map(rows.map((row)=>[
            row.method,
            row
        ]));
    return knownMethods.map((method)=>{
        const row = methodMap.get(method);
        return {
            method,
            amount: row ? row.amount : 0,
            count: row ? row.count : 0,
            percentage: total > 0 ? Number((row ? row.amount : 0) / total * 100).toFixed(2) : 0
        };
    });
};
const getDailySales = async (salonId, fromISO, toISO, fromDateStr, toDateStr)=>{
    const rows = await Transaction.aggregate([
        matchStage(salonId, fromISO, toISO),
        {
            $group: {
                _id: {
                    $dateToString: {
                        format: "%Y-%m-%d",
                        date: "$createdAt",
                        timezone: "Asia/Kolkata"
                    }
                },
                sales: {
                    $sum: "$finalAmount"
                },
                transactions: {
                    $sum: 1
                }
            }
        },
        {
            $sort: {
                _id: 1
            }
        },
        {
            $project: {
                _id: 0,
                date: "$_id",
                sales: 1,
                transactions: 1
            }
        }
    ]);
    const rowMap = new Map(rows.map((row)=>[
            row.date,
            row
        ]));
    const dates = [];
    let current = new Date(fromDateStr + "T00:00:00+05:30");
    const end = new Date(toDateStr + "T00:00:00+05:30");
    const { toISTDateString } = __turbopack_context__.r("[project]/lib/dates/timezone.js [app-route] (ecmascript)");
    while(current <= end){
        dates.push(toISTDateString(current));
        current.setTime(current.getTime() + 24 * 60 * 60 * 1000);
    }
    return dates.map((date)=>({
            date,
            sales: rowMap.get(date)?.sales || 0,
            transactions: rowMap.get(date)?.transactions || 0
        }));
};
const getRecentTransactions = async (salonId, fromISO, toISO, limit = 8)=>{
    const transactions = await Transaction.find({
        salonId,
        createdAt: {
            $gte: fromISO,
            $lt: toISO
        }
    }).sort({
        createdAt: -1
    }).limit(limit).lean();
    return transactions.map((t)=>({
            id: t._id,
            transactionNumber: t.transactionNumber,
            services: t.services.map((s)=>s.serviceName),
            finalAmount: t.finalAmount,
            paymentMethod: t.paymentMethod,
            createdAt: t.createdAt
        }));
};
const resolveReportDateRange = (searchParams)=>{
    const range = searchParams.get("range") || "";
    const fromRaw = searchParams.get("from");
    const toRaw = searchParams.get("to");
    const validRanges = [
        "today",
        "yesterday",
        "this-week",
        "this-month",
        "last-month"
    ];
    const isNamedRange = validRanges.includes(range);
    if (fromRaw || toRaw) {
        const datePattern = /^\d{4}-\d{2}-\d{2}$/;
        if (!datePattern.test(fromRaw || "") || !datePattern.test(toRaw || "")) {
            throw new AppError("Invalid date format. Use YYYY-MM-DD.", 400, "REPORT_INVALID_DATE");
        }
        if (fromRaw > toRaw) {
            throw new AppError("The start date must be before the end date", 400, "REPORT_INVALID_RANGE");
        }
        const resolved = resolveDateRange("custom", fromRaw, toRaw);
        if (resolved.toISO.getTime() - resolved.fromISO.getTime() > 366 * 24 * 60 * 60 * 1000) {
            throw new AppError("The date range cannot exceed 366 days", 400, "REPORT_INVALID_RANGE");
        }
        return {
            ...resolved,
            range: "custom"
        };
    }
    const safeRange = isNamedRange ? range : "today";
    return {
        ...resolveDateRange(safeRange),
        range: safeRange
    };
};
async function GET(request) {
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
        const { searchParams } = new URL(request.url);
        const { fromISO, toISO, from, to, range } = resolveReportDateRange(searchParams);
        const [summary, dailySales, topServices, payments, recentTransactions] = await Promise.all([
            getSummary(payload.salonId, fromISO, toISO),
            getDailySales(payload.salonId, fromISO, toISO, from, to),
            getTopServices(payload.salonId, fromISO, toISO, 5),
            getPaymentSummary(payload.salonId, fromISO, toISO),
            getRecentTransactions(payload.salonId, fromISO, toISO, 8)
        ]);
        return Response.json({
            success: true,
            data: {
                range,
                from,
                to,
                summary,
                dailySales,
                topServices,
                payments,
                recentTransactions
            }
        });
    } catch (error) {
        console.error("Dashboard report error:", error);
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
                code: "DASHBOARD_DATA_FAILED",
                message: "Unable to load sales data"
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
"[project]/lib/dates/timezone.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

const TIMEZONE = "Asia/Kolkata";
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
/**
 * Get date string (YYYY-MM-DD) for the IST (Asia/Kolkata) representation of a Date.
 * Computed as UTC date parts shifted by IST offset to avoid locale quirks.
 * @param {Date|number} date - Date object or timestamp
 * @returns {string} - YYYY-MM-DD in Asia/Kolkata
 */ const toISTDateString = (date)=>{
    const d = new Date(date.getTime ? date.getTime() : date);
    const ist = new Date(d.getTime() + IST_OFFSET_MS);
    const y = ist.getUTCFullYear();
    const m = String(ist.getUTCMonth() + 1).padStart(2, "0");
    const day = String(ist.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
};
/**
 * Get start of day in Asia/Kolkata for a given date string (YYYY-MM-DD)
 * Returns a Date whose UTC value corresponds to 00:00:00.000 IST.
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {Date}
 */ const getStartOfDay = (dateStr)=>{
    return new Date(dateStr + "T00:00:00+05:30");
};
/**
 * Get exclusive end of day (start of next day) in Asia/Kolkata.
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {Date}
 */ const getEndOfDay = (dateStr)=>{
    const d = getStartOfDay(dateStr);
    d.setTime(d.getTime() + 24 * 60 * 60 * 1000);
    return d;
};
/**
 * Today's date string in Asia/Kolkata (YYYY-MM-DD)
 * @returns {string}
 */ const getToday = ()=>{
    return toISTDateString(new Date());
};
/**
 * Yesterday's date string in Asia/Kolkata (YYYY-MM-DD)
 * @returns {string}
 */ const getYesterday = ()=>{
    const d = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
    return toISTDateString(d);
};
/**
 * Start of current week (Monday) in Asia/Kolkata (YYYY-MM-DD)
 * @returns {string}
 */ const getWeekStart = ()=>{
    const todayStr = getToday();
    const noon = new Date(todayStr + "T12:00:00+05:30");
    const day = noon.getUTCDay();
    const diff = day === 0 ? 6 : day - 1;
    const monday = new Date(noon.getTime() - diff * 24 * 60 * 60 * 1000);
    return toISTDateString(monday);
};
/**
 * Start of current month in Asia/Kolkata (YYYY-MM-01)
 * @returns {string}
 */ const getMonthStart = ()=>{
    const todayStr = getToday();
    return todayStr.slice(0, 8) + "01";
};
/**
 * First and last day of previous month in Asia/Kolkata
 * @returns {{ from: string, to: string }} - YYYY-MM-DD
 */ const getLastMonth = ()=>{
    const currentMonthStart = getMonthStart();
    const firstOfCurrent = new Date(currentMonthStart + "T00:00:00+05:30");
    const lastOfPrev = new Date(firstOfCurrent.getTime() - 24 * 60 * 60 * 1000);
    const lastOfPrevStr = toISTDateString(lastOfPrev);
    return {
        from: lastOfPrevStr.slice(0, 8) + "01",
        to: lastOfPrevStr
    };
};
/**
 * Resolve a named range or custom date range to { from, to, fromISO, toISO }.
 * fromISO/toISO are exclusive-boundary Dates for MongoDB queries:
 * createdAt >= fromISO and createdAt < toISO.
 * @param {string} range - today | yesterday | this-week | this-month | last-month
 * @param {string} from - custom from (YYYY-MM-DD)
 * @param {string} to - custom to (YYYY-MM-DD)
 * @returns {{ from: string, to: string, fromISO: Date, toISO: Date }}
 */ const resolveDateRange = (range, from, to)=>{
    let resolvedFrom, resolvedTo;
    switch(range){
        case "today":
            resolvedFrom = getToday();
            resolvedTo = getToday();
            break;
        case "yesterday":
            resolvedFrom = getYesterday();
            resolvedTo = getYesterday();
            break;
        case "this-week":
            resolvedFrom = getWeekStart();
            resolvedTo = getToday();
            break;
        case "last-month":
            {
                const lm = getLastMonth();
                resolvedFrom = lm.from;
                resolvedTo = lm.to;
                break;
            }
        case "this-month":
            resolvedFrom = getMonthStart();
            resolvedTo = getToday();
            break;
        default:
            if (from && to) {
                resolvedFrom = from;
                resolvedTo = to;
            } else {
                resolvedFrom = getToday();
                resolvedTo = getToday();
            }
    }
    return {
        from: resolvedFrom,
        to: resolvedTo,
        fromISO: getStartOfDay(resolvedFrom),
        toISO: getEndOfDay(resolvedTo)
    };
};
module.exports = {
    TIMEZONE,
    toISTDateString,
    getStartOfDay,
    getEndOfDay,
    getToday,
    getYesterday,
    getWeekStart,
    getMonthStart,
    getLastMonth,
    resolveDateRange
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
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1si2icg._.js.map