"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const isHash = process.env.HASH_KEY;
function hash(text) {
    if (!isHash) {
        throw new Error('there is no HashKey');
    }
    const hashed = crypto_1.default.createHmac('sha256', isHash).update(text).digest('hex');
    return hashed;
}
exports.default = hash;
