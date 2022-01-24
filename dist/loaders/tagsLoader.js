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
exports.tagsLoader = void 0;
const dataloader_1 = __importDefault(require("dataloader"));
const typeorm_1 = require("typeorm");
const PostsTags_1 = __importDefault(require("../entity/PostsTags"));
function normalize(array, selector = (item) => item.id) {
    const object = {};
    array.forEach(item => {
        object[selector(item)] = item;
    });
    return object;
}
const TagsLoader = (ids) => __awaiter(void 0, void 0, void 0, function* () {
    const getTags = (0, typeorm_1.getRepository)(PostsTags_1.default);
    const postsTags = yield getTags
        .createQueryBuilder('posts_tags')
        .where('post_id IN (:...ids)', { ids })
        .getMany();
    const normalized = normalize(postsTags, getTags => getTags.post_id);
    const getTag = ids.map((id) => normalized[id]);
    // return groupById<PostsTags>(ids, postsTags, (pt) => pt.post_id).map((array) =>
    //   array.map((pt) => pt.name),
    // );
    return getTag;
});
const tagsLoader = () => new dataloader_1.default(TagsLoader);
exports.tagsLoader = tagsLoader;
