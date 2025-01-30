"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkModel = exports.tagModel = exports.contentModel = exports.userModel = void 0;
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const user = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const content = new Schema({
    link: { type: String, required: true },
    type: { type: String, required: true },
    title: { type: String },
    tag: [{ tpye: String }],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }
});
const tag = new Schema({
    title: { type: String, unique: true, required: true }
});
const link = new Schema({
    hash: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true }
});
exports.userModel = mongoose.model("users", user);
exports.contentModel = mongoose.model("contents", content);
exports.tagModel = mongoose.model("tags", tag);
exports.linkModel = mongoose.model("links", link);
