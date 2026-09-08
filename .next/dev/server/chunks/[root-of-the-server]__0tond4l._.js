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
"[project]/app/api/services/route.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
const { connectDB, verifyAuth, unauthorizedResponse } = __turbopack_context__.r("[project]/lib/auth.js [app-route] (ecmascript)");
const serviceService = __turbopack_context__.r("[project]/services/service/serviceService.js [app-route] (ecmascript)");
const AppError = __turbopack_context__.r("[project]/lib/errors/AppError.js [app-route] (ecmascript)");
async function GET(request) {
    try {
        await connectDB();
        const payload = verifyAuth(request);
        if (!payload) return unauthorizedResponse();
        const { searchParams } = new URL(request.url);
        const result = await serviceService.listServices({
            salonId: payload.salonId,
            page: searchParams.get("page"),
            limit: searchParams.get("limit"),
            category: searchParams.get("category"),
            search: searchParams.get("search")
        });
        return Response.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error("Service list error:", error);
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
async function POST(request) {
    try {
        await connectDB();
        const payload = verifyAuth(request);
        if (!payload) return unauthorizedResponse();
        const contentType = request.headers.get("content-type") || "";
        let body;
        if (contentType.includes("multipart/form-data")) {
            const formData = await request.formData();
            body = {
                name: formData.get("name"),
                category: formData.get("category"),
                price: formData.get("price") ? Number(formData.get("price")) : undefined,
                image: formData.get("image")
            };
        } else {
            body = await request.json();
        }
        const result = await serviceService.createService({
            name: body.name,
            category: body.category,
            price: body.price,
            image: body.image,
            salonId: payload.salonId
        });
        return Response.json({
            success: true,
            data: result
        }, {
            status: 201
        });
    } catch (error) {
        console.error("Service creation error:", error);
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
"[project]/services/service/serviceService.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

const Service = __turbopack_context__.r("[project]/models/Service.js [app-route] (ecmascript)");
const AppError = __turbopack_context__.r("[project]/lib/errors/AppError.js [app-route] (ecmascript)");
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif"
];
const processImage = async (image)=>{
    if (!image) return null;
    if (typeof image === "string") {
        if (image.startsWith("data:image")) {
            return image;
        }
        return null;
    }
    if (image instanceof File || image.size !== undefined && image.type !== undefined) {
        if (!ALLOWED_IMAGE_TYPES.includes(image.type)) {
            throw new AppError("Invalid image type. Allowed: JPEG, PNG, WebP, GIF", 400, "SERVICE_INVALID_IMAGE_TYPE");
        }
        if (image.size > MAX_IMAGE_SIZE) {
            throw new AppError("Image size must be less than 5MB", 400, "SERVICE_IMAGE_TOO_LARGE");
        }
        const buffer = Buffer.from(await image.arrayBuffer());
        const base64 = buffer.toString("base64");
        return `data:${image.type};base64,${base64}`;
    }
    return null;
};
const createService = async (payload)=>{
    const { name, category, price, image } = payload;
    const salonId = payload.salonId;
    if (!name || name.trim().length === 0) {
        throw new AppError("Service name is required", 400, "SERVICE_VALIDATION_ERROR");
    }
    if (price === undefined || isNaN(price) || price < 0) {
        throw new AppError("Service price must be a non-negative number", 400, "SERVICE_VALIDATION_ERROR");
    }
    const normalizedName = name.trim();
    const existingService = await Service.findOne({
        salonId,
        name: {
            $regex: new RegExp("^" + normalizedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$", "i")
        }
    });
    if (existingService) {
        throw new AppError("A service with this name already exists in your salon", 409, "SERVICE_DUPLICATE");
    }
    const imageData = await processImage(image);
    const service = new Service({
        salonId,
        name: normalizedName,
        category: category ? category.trim() : "",
        price,
        image: imageData
    });
    await service.save();
    return formatServiceResponse(service);
};
const listServices = async (params)=>{
    const { salonId, page = 1, limit = 20, category, search } = params;
    const pageNum = Math.max(1, Math.floor(page));
    const limitNum = Math.min(Math.max(1, limit), 500);
    const filter = {
        salonId
    };
    if (category && category.trim()) {
        filter.category = category.trim();
    }
    if (search && search.trim()) {
        filter.name = {
            $regex: new RegExp(search.trim(), "i")
        };
    }
    const total = await Service.countDocuments(filter);
    const services = await Service.find(filter).sort({
        name: 1
    }).skip((pageNum - 1) * limitNum).limit(limitNum);
    const safeServices = services.map((s)=>formatServiceResponse(s));
    return {
        services: safeServices,
        pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum) || 1
        }
    };
};
const getServiceById = async (id, salonId)=>{
    const service = await Service.findOne({
        _id: id,
        salonId
    });
    if (!service) {
        throw new AppError("Service not found", 404, "SERVICE_NOT_FOUND");
    }
    return formatServiceResponse(service);
};
const updateService = async (id, updates, salonId)=>{
    const service = await Service.findOne({
        _id: id,
        salonId
    });
    if (!service) {
        throw new AppError("Service not found", 404, "SERVICE_NOT_FOUND");
    }
    if (updates.name !== undefined) {
        if (!updates.name || updates.name.trim().length === 0) {
            throw new AppError("Service name cannot be empty", 400, "SERVICE_VALIDATION_ERROR");
        }
        const normalizedName = updates.name.trim();
        const existingService = await Service.findOne({
            salonId,
            name: {
                $regex: new RegExp("^" + normalizedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$", "i")
            },
            _id: {
                $ne: id
            }
        });
        if (existingService) {
            throw new AppError("A service with this name already exists in your salon", 409, "SERVICE_DUPLICATE");
        }
        service.name = normalizedName;
    }
    if (updates.category !== undefined) {
        service.category = updates.category.trim();
    }
    if (updates.price !== undefined) {
        if (isNaN(updates.price) || updates.price < 0) {
            throw new AppError("Service price must be a non-negative number", 400, "SERVICE_VALIDATION_ERROR");
        }
        service.price = updates.price;
    }
    if (updates.image !== undefined) {
        const imageData = await processImage(updates.image);
        service.image = imageData;
    }
    await service.save();
    return formatServiceResponse(service);
};
const deleteService = async (id, salonId)=>{
    const service = await Service.findOneAndDelete({
        _id: id,
        salonId
    });
    if (!service) {
        throw new AppError("Service not found", 404, "SERVICE_NOT_FOUND");
    }
    return {
        success: true,
        message: "Service deleted"
    };
};
const formatServiceResponse = (service)=>({
        id: service._id,
        salonId: service.salonId,
        name: service.name,
        category: service.category,
        price: service.price,
        image: service.image || null,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt
    });
module.exports = {
    createService,
    listServices,
    getServiceById,
    updateService,
    deleteService
};
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0tond4l._.js.map