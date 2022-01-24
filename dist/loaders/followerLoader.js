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
exports.followerLoader = void 0;
const typeorm_1 = require("typeorm");
const dataloader_1 = __importDefault(require("dataloader"));
const Followers_1 = __importDefault(require("../entity/Followers"));
function normalize(array, selector = (item) => item.id) {
    const object = {};
    array.forEach((item) => {
        object[selector(item)] = item;
    });
    return object;
}
const FollowerLoader = (ids) => __awaiter(void 0, void 0, void 0, function* () {
    const follower = (0, typeorm_1.getRepository)(Followers_1.default);
    const userFollower = yield follower
        .createQueryBuilder('followers')
        .where('user_id IN (:...ids)', { ids })
        .getMany();
    const normalized = normalize(userFollower, (follower) => follower.user_id);
    const ordered = ids.map((id) => normalized[id]);
    return ordered;
});
const followerLoader = () => new dataloader_1.default(FollowerLoader);
exports.followerLoader = followerLoader;
