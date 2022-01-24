"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Comment_1 = __importDefault(require("./Comment"));
const Post_1 = __importDefault(require("./Post"));
const PostLike_1 = __importDefault(require("./PostLike"));
const PostScore_1 = __importDefault(require("./PostScore"));
const PostsTags_1 = __importDefault(require("./PostsTags"));
const User_1 = __importDefault(require("./User"));
const UserProfile_1 = __importDefault(require("./UserProfile"));
const PostReadLog_1 = __importDefault(require("./PostReadLog"));
const Following_1 = __importDefault(require("./Following"));
const Followers_1 = __importDefault(require("./Followers"));
const Tag_1 = __importDefault(require("./Tag"));
const SocialUser_1 = __importDefault(require("./SocialUser"));
const AuthToken_1 = __importDefault(require("./AuthToken"));
const entitie = [
    Comment_1.default,
    Following_1.default,
    Followers_1.default,
    Post_1.default,
    PostLike_1.default,
    PostScore_1.default,
    PostsTags_1.default,
    User_1.default,
    UserProfile_1.default,
    PostReadLog_1.default,
    Tag_1.default,
    SocialUser_1.default,
    AuthToken_1.default,
];
exports.default = entitie;
