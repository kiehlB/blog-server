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
exports.commentsLoader = void 0;
const typeorm_1 = require("typeorm");
const dataloader_1 = __importDefault(require("dataloader"));
const Post_1 = __importDefault(require("../entity/Post"));
function normalize(array, selector = (item) => item.id) {
    const object = {};
    array.forEach((item) => {
        object[selector(item)] = item;
    });
    return object;
}
const CommentsLoader = (ids) => __awaiter(void 0, void 0, void 0, function* () {
    const posts = yield (0, typeorm_1.getManager)()
        .createQueryBuilder(Post_1.default, 'post')
        .leftJoinAndSelect('post.comments', 'comment')
        .whereInIds(ids)
        .andWhere('(deleted = false or has_replies = true)')
        .orderBy({
        'comment.created_at': 'ASC',
    })
        .getMany();
    const normalized = normalize(posts);
    const getcomments = ids.map((id) => normalized[id] ? normalized[id].comments : []);
    return getcomments;
});
const commentsLoader = () => new dataloader_1.default(CommentsLoader);
exports.commentsLoader = commentsLoader;
