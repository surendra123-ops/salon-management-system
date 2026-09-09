module.exports = [
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[project]/app/(dashboard)/dashboard/page.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DashboardPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$dates$2f$timezone$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/dates/timezone.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$Transaction$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/models/Transaction.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$dashboard$2f$DashboardContent$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/dashboard/DashboardContent.js [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
async function fetchDashboardData(rangeParam) {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["connectDB"])();
    const { cookies } = __turbopack_context__.r("[project]/node_modules/next/headers.js [app-rsc] (ecmascript)");
    const jwt = __turbopack_context__.r("[project]/node_modules/jsonwebtoken/index.js [app-rsc] (ecmascript)");
    const { env } = __turbopack_context__.r("[project]/config/env.js [app-rsc] (ecmascript)");
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;
    let payload;
    try {
        payload = jwt.verify(token, env.SESSION_SECRET);
    } catch  {
        return null;
    }
    if (payload.role !== "owner") return null;
    const validRanges = [
        "today",
        "yesterday",
        "this-week",
        "last-week",
        "this-month",
        "last-month"
    ];
    const safeRange = validRanges.includes(rangeParam) ? rangeParam : "today";
    const { fromISO, toISO, from, to } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$dates$2f$timezone$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveDateRange"])(safeRange);
    const matchStage = {
        salonId: payload.salonId,
        createdAt: {
            $gte: fromISO,
            $lt: toISO
        }
    };
    const [summaryResult, dailySales, topServices, payments, recentTransactions] = await Promise.all([
        __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$Transaction$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].aggregate([
            {
                $match: matchStage
            },
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
        ]),
        __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$Transaction$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].aggregate([
            {
                $match: matchStage
            },
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
        ]),
        __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$Transaction$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].aggregate([
            {
                $match: matchStage
            },
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
                $limit: 5
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
        ]),
        __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$Transaction$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].aggregate([
            {
                $match: matchStage
            },
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
        ]),
        __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$Transaction$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].find({
            salonId: payload.salonId,
            createdAt: {
                $gte: fromISO,
                $lt: toISO
            }
        }).sort({
            createdAt: -1
        }).limit(8).lean()
    ]);
    const summary = summaryResult[0] || {
        grossSales: 0,
        discounts: 0,
        netSales: 0,
        amountCollected: 0,
        amountDue: 0,
        transactions: 0
    };
    const avgBill = summary.transactions > 0 ? Number((summary.netSales / summary.transactions).toFixed(2)) : 0;
    const totalPaid = payments.reduce((sum, row)=>sum + row.amount, 0);
    const knownMethods = [
        "cash",
        "upi",
        "card",
        "other"
    ];
    const methodMap = new Map(payments.map((row)=>[
            row.method,
            row
        ]));
    const paymentsFormatted = knownMethods.map((method)=>{
        const row = methodMap.get(method);
        return {
            method,
            amount: row ? row.amount : 0,
            count: row ? row.count : 0,
            percentage: totalPaid > 0 ? Number((row ? row.amount : 0) / totalPaid * 100).toFixed(2) : 0
        };
    });
    const recentFormatted = recentTransactions.map((t)=>({
            id: t._id.toString(),
            transactionNumber: t.transactionNumber,
            services: t.services.map((s)=>s.serviceName),
            finalAmount: t.finalAmount,
            paymentMethod: t.paymentMethod,
            createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : String(t.createdAt)
        }));
    return {
        range: safeRange,
        from: from instanceof Date ? from.toISOString() : String(from),
        to: to instanceof Date ? to.toISOString() : String(to),
        summary: {
            ...summary,
            averageBill: avgBill
        },
        dailySales,
        topServices,
        payments: paymentsFormatted,
        recentTransactions: recentFormatted
    };
}
async function DashboardPage({ searchParams }) {
    const params = await searchParams;
    const range = params?.range || "today";
    const data = await fetchDashboardData(range);
    if (!data) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/login");
    }
    const hasData = (data.summary.transactions || 0) > 0;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "max-w-7xl mx-auto p-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-card rounded-lg shadow-xl p-6 mb-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-3xl font-bold text-primary",
                        children: "Welcome, Owner"
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/dashboard/page.js",
                        lineNumber: 154,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-secondary mt-1",
                        children: "Here's how your salon is performing."
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/dashboard/page.js",
                        lineNumber: 155,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(dashboard)/dashboard/page.js",
                lineNumber: 153,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$dashboard$2f$DashboardContent$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                initialData: data,
                hasData: hasData
            }, void 0, false, {
                fileName: "[project]/app/(dashboard)/dashboard/page.js",
                lineNumber: 158,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/(dashboard)/dashboard/page.js",
        lineNumber: 152,
        columnNumber: 5
    }, this);
}
}),
"[project]/app/(dashboard)/dashboard/page.js [app-rsc] (ecmascript, Next.js Server Component)", (function(__turbopack_context__){

__turbopack_context__.n(__turbopack_context__.i("[project]/app/(dashboard)/dashboard/page.js [app-rsc] (ecmascript)"));
}),
"[project]/components/dashboard/DashboardContent.js [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/components/dashboard/DashboardContent.js from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/components/dashboard/DashboardContent.js", "default");
}),
"[project]/components/dashboard/DashboardContent.js [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/components/dashboard/DashboardContent.js <module evaluation> from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/components/dashboard/DashboardContent.js <module evaluation>", "default");
}),
"[project]/components/dashboard/DashboardContent.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$dashboard$2f$DashboardContent$2e$js__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/components/dashboard/DashboardContent.js [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$dashboard$2f$DashboardContent$2e$js__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/components/dashboard/DashboardContent.js [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$dashboard$2f$DashboardContent$2e$js__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/config/env.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

const { z } = __turbopack_context__.r("[project]/node_modules/zod/index.cjs [app-rsc] (ecmascript)");
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
"[project]/lib/auth.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

const jwt = __turbopack_context__.r("[project]/node_modules/jsonwebtoken/index.js [app-rsc] (ecmascript)");
const connectDB = __turbopack_context__.r("[project]/lib/db/mongodb.js [app-rsc] (ecmascript)");
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
    const { env } = __turbopack_context__.r("[project]/config/env.js [app-rsc] (ecmascript)");
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
"[project]/lib/dates/timezone.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

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
        case "last-week":
            {
                const thisWeekStart = getWeekStart();
                const thisWeekStartNoon = new Date(thisWeekStart + "T12:00:00+05:30");
                const lastWeekEnd = new Date(thisWeekStartNoon.getTime() - 24 * 60 * 60 * 1000);
                const lastWeekEndStr = toISTDateString(lastWeekEnd);
                const lastWeekEndNoon = new Date(lastWeekEndStr + "T12:00:00+05:30");
                const day = lastWeekEndNoon.getUTCDay();
                const diff = day === 0 ? 6 : day - 1;
                const lastWeekStart = new Date(lastWeekEndNoon.getTime() - diff * 24 * 60 * 60 * 1000);
                resolvedFrom = toISTDateString(lastWeekStart);
                resolvedTo = lastWeekEndStr;
                break;
            }
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
"[project]/lib/db/mongodb.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

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
    const uri = __turbopack_context__.r("[project]/config/env.js [app-rsc] (ecmascript)").env.MONGODB_URI;
    const dbName = __turbopack_context__.r("[project]/config/env.js [app-rsc] (ecmascript)").env.MONGODB_DB_NAME;
    const opts = {
        dbName,
        bufferCommands: false
    };
    return mongoose.connect(uri, opts);
}
module.exports = connect;
}),
"[project]/models/Transaction.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

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

//# sourceMappingURL=%5Broot-of-the-server%5D__19pkrol._.js.map