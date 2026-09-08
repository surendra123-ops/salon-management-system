(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push(["chunks/[root-of-the-server]__0620vuz._.js",
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[project]/middleware.js [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Next.js middleware - minimal pass-through
// This file is required by Next.js App Router but primarily
// serves as a placeholder for future middleware needs.
// Next.js expects a middleware function export
__turbopack_context__.s([
    "config",
    ()=>config,
    "middleware",
    ()=>middleware
]);
const config = {
    matcher: []
};
function middleware(request) {
    // Pass through to the request handler
    // Request ID setup is done in route handlers via lib/middleware
    return new Response(null, {
        status: 200
    });
}
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__0620vuz._.js.map