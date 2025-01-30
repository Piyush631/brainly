"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const zod_1 = require("zod");
const db_1 = require("./db");
const bcrypt = require("bcrypt");
const authMiddleware_1 = require("./authMiddleware");
const utils_1 = require("./utils");
const cors_1 = __importDefault(require("cors"));
const JWT_SECRET = "piyush12345";
const app = express();
app.use(express.json());
app.use((0, cors_1.default)());
app.post("/api/v1/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    //create a zod validation
    const userValidation = zod_1.z.object({
        username: zod_1.z.string().min(3).max(30),
        password: zod_1.z.string().min(5, { message: "password is too short" }).max(20)
    });
    const parseData = userValidation.safeParse(req.body);
    if (!parseData.success) {
        res.status(400).json({
            msg: parseData.error
        });
        return;
    }
    else {
        //hasing a password
        const hashedPassword = yield bcrypt.hash(password, 5);
        //storing a data  in a database 
        try {
            yield db_1.userModel.create({
                username: username,
                password: hashedPassword
            });
            res.json({
                msg: "user is successfully signup"
            });
            return;
        }
        catch (err) {
            res.status(402).json({
                msg: "user is already exist"
            });
            return;
        }
    }
}));
app.post("/api/v1/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    const userValidation = zod_1.z.object({
        username: zod_1.z.string().min(3).max(30),
        password: zod_1.z.string().min(5).max(30)
    });
    const parseData = userValidation.safeParse(req.body);
    if (!parseData.success) {
        res.json({
            msg: parseData.error
        });
        return;
    }
    try {
        const response = yield db_1.userModel.findOne({
            username: username
        });
        if (!response.username) {
            res.status(400).json({
                msg: "user doest not exist"
            });
            return;
        }
        const passwordmatch = yield bcrypt.compare(password, response.password);
        if (!passwordmatch) {
            res.json({
                msg: "password does not match"
            });
            return;
        }
        if (response && passwordmatch) {
            const token = jwt.sign({
                id: response._id
            }, JWT_SECRET);
            res.json({
                token: token
            });
            return;
        }
    }
    catch (error) {
        res.json({
            msg: "invalid details"
        });
    }
}));
app.post("/api/v1/content", authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { link, type, title, tag } = req.body;
    try {
        yield db_1.contentModel.create({
            link: link,
            type: type,
            title: title,
            tag: tag,
            //@ts-ignore
            userId: req.userId
        });
        res.json({
            msg: "Content added successfully"
        });
    }
    catch (error) {
        res.json({
            error
        });
    }
}));
app.get("/api/v1/content", authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield db_1.contentModel.find({
            //@ts-ignore
            userId: req.userId
        }).populate("userId", "username");
        res.json({
            data
        });
    }
    catch (e) {
        res.json({
            msg: "content not found"
        });
    }
}));
app.delete("/api/v1/content", authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.body;
    try {
        yield db_1.contentModel.deleteOne({
            //@ts-ignore
            userId: req.userId,
            _id: id
        });
        res.json({
            msg: "content delete successfully"
        });
    }
    catch (e) {
        res.json({
            msg: "content is not found"
        });
    }
}));
app.post("/api/v1/brain/sharelink", authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const share = req.body.share;
    if (share) {
        const existingLink = yield db_1.linkModel.findOne({
            //@ts-ignore
            userId: req.userId
        });
        if (existingLink) {
            res.json({
                msg: "Link is already created"
            });
            return;
        }
        const hash = (0, utils_1.random)(10);
        yield db_1.linkModel.create({
            hash: hash,
            //@ts-ignore
            userId: req.userId
        });
        res.json({
            msg: hash
        });
    }
    else {
        yield db_1.linkModel.deleteOne({
            //@ts-ignore
            userId: req.userID
        });
        res.json({
            message: "Link is removed"
        });
    }
}));
app.get("/api/v1/brain/:sharelink", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const hash = req.params.sharelink;
    const link = yield db_1.linkModel.findOne({
        hash
    });
    if (!link) {
        res.json({
            msg: "link is not found"
        });
        return;
    }
    const content = yield db_1.contentModel.find({
        userId: link.userId
    });
    const user = yield db_1.userModel.findOne({
        _id: link.userId
    });
    if (!user) {
        res.json({
            msg: "user is not found"
        });
        return;
    }
    res.json({
        user: user.username,
        content
    });
}));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        mongoose.connect('mongodb+srv://admin:Kangra%40123@cluster0.9j1kk.mongodb.net/brainly-app');
        app.listen(3000);
        console.log("you are connected to database");
    });
}
main();
