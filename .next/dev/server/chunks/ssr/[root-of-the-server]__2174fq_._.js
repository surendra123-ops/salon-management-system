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
"[project]/app/(dashboard)/transactions/page.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TransactionsPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jsonwebtoken/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$env$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/config/env.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$Transaction$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/models/Transaction.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$transactions$2f$TransactionsManager$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/transactions/TransactionsManager.js [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
;
async function TransactionsPage() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cookies"])();
    const token = cookieStore.get("token")?.value;
    if (!token) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/login");
    }
    let payload;
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["connectDB"])();
        payload = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].verify(token, __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$env$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["env"].SESSION_SECRET);
    } catch  {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/login");
    }
    const transactions = await __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$Transaction$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].find({
        salonId: payload.salonId
    }).sort({
        createdAt: -1
    }).limit(20).lean();
    const total = await __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$Transaction$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].countDocuments({
        salonId: payload.salonId
    });
    const formattedTransactions = transactions.map((t)=>({
            id: t._id.toString(),
            transactionNumber: t.transactionNumber,
            services: t.services.map((s)=>s.serviceName),
            subtotal: t.subtotal,
            discount: t.discount,
            finalAmount: t.finalAmount,
            paymentMethod: t.paymentMethod,
            paymentStatus: t.paymentStatus,
            amountPaid: t.amountPaid,
            amountDue: t.amountDue,
            notes: t.notes,
            createdAt: t.createdAt?.toISOString()
        }));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-background",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$transactions$2f$TransactionsManager$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                initialTransactions: formattedTransactions,
                initialTotal: total
            }, void 0, false, {
                fileName: "[project]/app/(dashboard)/transactions/page.js",
                lineNumber: 50,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/(dashboard)/transactions/page.js",
            lineNumber: 49,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/(dashboard)/transactions/page.js",
        lineNumber: 48,
        columnNumber: 5
    }, this);
}
}),
"[project]/app/(dashboard)/transactions/page.js [app-rsc] (ecmascript, Next.js Server Component)", (function(__turbopack_context__){

__turbopack_context__.n(__turbopack_context__.i("[project]/app/(dashboard)/transactions/page.js [app-rsc] (ecmascript)"));
}),
"[project]/components/transactions/TransactionsManager.js [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/components/transactions/TransactionsManager.js from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/components/transactions/TransactionsManager.js", "default");
}),
"[project]/components/transactions/TransactionsManager.js [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/components/transactions/TransactionsManager.js <module evaluation> from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/components/transactions/TransactionsManager.js <module evaluation>", "default");
}),
"[project]/components/transactions/TransactionsManager.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$transactions$2f$TransactionsManager$2e$js__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/components/transactions/TransactionsManager.js [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$transactions$2f$TransactionsManager$2e$js__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/components/transactions/TransactionsManager.js [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$transactions$2f$TransactionsManager$2e$js__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
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

//# sourceMappingURL=%5Broot-of-the-server%5D__2174fq_._.js.map