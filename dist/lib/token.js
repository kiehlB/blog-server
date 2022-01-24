"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeToken = exports.sendRefreshToken = exports.createTokens = exports.setTokenCookie = exports.validateRefreshToken = exports.validateAccessToken = exports.createRefreshToken = exports.createAccessToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importStar(require("jsonwebtoken"));
const generateToken = (user, options) => __awaiter(void 0, void 0, void 0, function* () {
    const jwtOptions = Object.assign({ expiresIn: '7d' }, options);
    const secretKey = process.env.REFRESH_TOKEN_SECRET;
    if (!jwtOptions.expiresIn) {
        // removes expiresIn when expiresIn is given as undefined
        delete jwtOptions.expiresIn;
    }
    return new Promise((resolve, reject) => {
        if (!secretKey)
            return;
        jsonwebtoken_1.default.sign(user, secretKey, jwtOptions, (err, token) => {
            if (err)
                reject(err);
            resolve(token);
        });
    });
});
exports.generateToken = generateToken;
const createAccessToken = (user) => {
    return (0, jsonwebtoken_1.sign)({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '15min',
    });
};
exports.createAccessToken = createAccessToken;
const createRefreshToken = (user) => {
    return (0, jsonwebtoken_1.sign)({
        user: { userId: user.id, tokenVersion: user.tokenVersion },
    }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '3d',
    });
};
exports.createRefreshToken = createRefreshToken;
const validateAccessToken = (token) => {
    try {
        return (0, jsonwebtoken_1.verify)(token, process.env.ACCESS_TOKEN_SECRET);
    }
    catch (e) {
        console.log(e);
        return null;
    }
};
exports.validateAccessToken = validateAccessToken;
const validateRefreshToken = (token) => {
    try {
        return (0, jsonwebtoken_1.verify)(token, process.env.REFRESH_TOKEN_SECRET);
    }
    catch (e) {
        console.log(e);
        return null;
    }
};
exports.validateRefreshToken = validateRefreshToken;
function setTokenCookie(res, tokens) {
    // set cookie
    res.cookie('access_token', tokens.accessToken, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60,
    });
    res.cookie('refresh_token', tokens.refreshToken, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 30,
    });
    // Following codes are for webpack-dev-server proxy
    res.cookie('access_token', tokens.accessToken, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60,
    });
    res.cookie('refresh_token', tokens.refreshToken, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 30,
    });
}
exports.setTokenCookie = setTokenCookie;
const createTokens = (user) => {
    const accessToken = (0, exports.createAccessToken)(user);
    const refreshToken = (0, exports.createRefreshToken)(user);
    return { accessToken, refreshToken };
};
exports.createTokens = createTokens;
const sendRefreshToken = (res, token) => {
    res.cookie('refresh_token', token, {
        httpOnly: true,
        secure: false,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });
};
exports.sendRefreshToken = sendRefreshToken;
const decodeToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    const secretKey = process.env.REFRESH_TOKEN_SECRET;
    return new Promise((resolve, reject) => {
        if (!secretKey)
            return;
        jsonwebtoken_1.default.verify(token, secretKey, (err, decoded) => {
            if (err)
                reject(err);
            resolve(decoded);
        });
    });
});
exports.decodeToken = decodeToken;
