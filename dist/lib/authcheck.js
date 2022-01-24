"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.schemaLogin = exports.schema = void 0;
const joi_1 = __importDefault(require("@hapi/joi"));
exports.schema = joi_1.default.object().keys({
    email: joi_1.default.string()
        .email({
        minDomainSegments: 2,
        tlds: { allow: ['com', 'net'] },
    })
        .required(),
    password: joi_1.default.string()
        .min(5)
        .max(100)
        .required()
        .pattern(/^[a-zA-Z0-9]{3,30}$/),
    username: joi_1.default.string().alphanum().min(2).max(30).required(),
});
exports.schemaLogin = joi_1.default.object().keys({
    email: joi_1.default.string()
        .email({
        minDomainSegments: 2,
        tlds: { allow: ['com', 'net'] },
    })
        .required(),
    password: joi_1.default.string()
        .min(5)
        .max(100)
        .required()
        .pattern(/^[a-zA-Z0-9]{3,30}$/),
});
