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
exports.profileLoader = void 0;
const typeorm_1 = require("typeorm");
const UserProfile_1 = __importDefault(require("../entity/UserProfile"));
const dataloader_1 = __importDefault(require("dataloader"));
function normalize(array, selector = (item) => item.id) {
    const object = {};
    array.forEach((item) => {
        object[selector(item)] = item;
    });
    return object;
}
const ProfileLoader = (ids) => __awaiter(void 0, void 0, void 0, function* () {
    const profile = (0, typeorm_1.getRepository)(UserProfile_1.default);
    const profiles = yield profile
        .createQueryBuilder('user_profiles')
        .where('user_id IN (:...ids)', { ids })
        .getMany();
    const normalized = normalize(profiles, (profile) => profile.user_id);
    const ordered = ids.map((id) => normalized[id]);
    return ordered;
});
const profileLoader = () => new dataloader_1.default(ProfileLoader);
exports.profileLoader = profileLoader;
