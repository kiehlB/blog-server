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
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = require("jsonwebtoken");
const User_1 = __importDefault(require("../entity/User"));
const typeorm_1 = require("typeorm");
const token_1 = require("../lib/token");
const router = express_1.default.Router();
router.post('/refresh_token', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.cookies.jid;
    if (!token) {
        return res.send({ ok: false, accessToken: '' });
    }
    let payload = null;
    try {
        payload = (0, jsonwebtoken_1.verify)(token, process.env.REFRESH_TOKEN_SECRET);
    }
    catch (err) {
        console.log(err);
        return res.send({ ok: false, accessToken: '' });
    }
    const findUser = (0, typeorm_1.getRepository)(User_1.default);
    const user = yield findUser.findOne({ id: payload.userId });
    if (!user) {
        return res.send({ ok: false, accessToken: '' });
    }
    if (user.tokenVersion !== payload.tokenVersion) {
        return res.send({ ok: false, accessToken: '' });
    }
    (0, token_1.sendRefreshToken)(res, (0, token_1.createRefreshToken)(user));
    return res.send({ ok: true, accessToken: (0, token_1.generateToken)(user) });
}));
exports.default = router;
