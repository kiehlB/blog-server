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
exports.ValidateTokensMiddleware = exports.refresh = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const User_1 = __importDefault(require("../entity/User"));
const typeorm_1 = require("typeorm");
const token_1 = require("../lib/token");
const refresh = (res, refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const decoded = yield (0, token_1.decodeToken)(refreshToken);
        const user = yield (0, typeorm_1.getRepository)(User_1.default).findOne(decoded.user_id);
        if (!user) {
            const error = new Error('InvalidUserError');
            throw error;
        }
        const tokens = yield user.refreshUserToken(decoded.token_id, decoded.exp, refreshToken);
        (0, token_1.setTokenCookie)(res, tokens);
        return decoded.user_id;
    }
    catch (e) {
        throw e;
    }
});
exports.refresh = refresh;
const ValidateTokensMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const accessToken = req.cookies['access_token'];
    const refreshToken = req.cookies['refresh_token'];
    let data;
    try {
        data = (0, jsonwebtoken_1.verify)(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        res.locals.user_id = data.user.userId;
        const diff = data.exp * 1000 - new Date().getTime();
        if (diff < 1000 * 60 * 30 && refreshToken) {
            yield (0, exports.refresh)(res, refreshToken);
        }
    }
    catch (e) {
        if (!refreshToken)
            return next();
        try {
            const userId = yield (0, exports.refresh)(res, refreshToken);
            // set user_id if succeeds
            res.locals.user_id = userId;
        }
        catch (e) { }
    }
    return next();
});
exports.ValidateTokensMiddleware = ValidateTokensMiddleware;
