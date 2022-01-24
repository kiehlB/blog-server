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
exports.userLoader = void 0;
const dataloader_1 = __importDefault(require("dataloader"));
const User_1 = __importDefault(require("../entity/User"));
const typeorm_1 = require("typeorm");
function normalize(array, selector = (item) => item.id) {
    const object = {};
    array.forEach((item) => {
        object[selector(item)] = item;
    });
    return object;
}
const Users = (ids) => __awaiter(void 0, void 0, void 0, function* () {
    const getUser = (0, typeorm_1.getRepository)(User_1.default);
    const users = yield getUser.findByIds(ids);
    const normalized = normalize(users, (user) => user.id);
    return ids.map((id) => normalized[id]);
});
const userLoader = () => new dataloader_1.default(Users);
exports.userLoader = userLoader;
