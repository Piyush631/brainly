"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jwt = require("jsonwebtoken");
const JWT_SECRET = "piyush12345";
function authMiddleware(req, res, next) {
    const header = req.headers["authorization"];
    const decoded = jwt.verify(header, JWT_SECRET);
    if (decoded) {
        //@ts-ignore   
        req.userId = decoded.id;
        next();
    }
    else {
        res.json({
            msg: "error in connection"
        });
    }
}
