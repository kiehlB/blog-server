"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UserLoader_1 = require("./UserLoader");
const ProfileLoader_1 = require("./ProfileLoader");
const followerLoader_1 = require("./followerLoader");
const tagsLoader_1 = require("./tagsLoader");
const commentsLoader_1 = require("./commentsLoader");
function createLoaders() {
    return {
        user: (0, UserLoader_1.userLoader)(),
        userProfile: (0, ProfileLoader_1.profileLoader)(),
        follower: (0, followerLoader_1.followerLoader)(),
        comments: (0, commentsLoader_1.commentsLoader)(),
        tags: (0, tagsLoader_1.tagsLoader)(),
    };
}
exports.default = createLoaders;
