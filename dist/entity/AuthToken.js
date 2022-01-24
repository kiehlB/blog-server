"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const User_1 = __importDefault(require("./User"));
let AuthToken = class AuthToken {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AuthToken.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], AuthToken.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)('timestampz'),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], AuthToken.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)('timestamptz'),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], AuthToken.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], AuthToken.prototype, "disabled", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(type => User_1.default, user => user.id, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: ' user_id' }),
    __metadata("design:type", User_1.default)
], AuthToken.prototype, "user", void 0);
AuthToken = __decorate([
    (0, typeorm_1.Entity)('auth_tokens', {
        synchronize: true,
    })
], AuthToken);
exports.default = AuthToken;