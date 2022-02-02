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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user = __importStar(require("./resolvers/user"));
const post = __importStar(require("./resolvers/post"));
const comments = __importStar(require("./resolvers/comments"));
const merge_1 = __importDefault(require("lodash/merge"));
const schema_1 = require("@graphql-tools/schema");
const typeDef = `
  type Query {
    user(id: String, username: String): User!
    users: [User]
    me: User

    post(id: String): Post
    posts(cursor: String, after: String) :[Post]
    searchPosts(searchInput: String):[Post]
    getImageUrl: ImageUrl
    topFivePost(offset: Int, limit: Int): [Post]


    comment: [Comment]
    subcomments(comment_id: String): [Comment]

  }
  type Mutation {
    register(email: String!, username: String!, password: String!): User!
    login(email: String!, password: String!): User!
    createProfile(bio: String): UserProfile!
    updateProfile(bio: String): UserProfile!
    followUser(username: String!): Followers
    unFollowUser(username: String!): Followers!
    revokeRefreshToken(userId: String!): Boolean
    logout: Boolean

    createPost(
      title: String
      body: String
      tags: String
      thumbnail: String
    ): Post
    editPost(post_id: String, title: String, body: String): Post
    removePost(post_id: String!): Boolean
    likePost(id: String!): Post
    unLikePost(id: String!): Post
    uploadImage(body: String): UploadedImage
    postView(id: String!): Boolean

   
    createComment(post_id: String, text: String, comment_id: String): Comment
    removeComment(id: String!): Boolean
    editComment(id: String, text: String): Comment
  }
`;
const resolvers = {
    Query: {},
    Mutation: {},
};
const schema = (0, schema_1.makeExecutableSchema)({
    typeDefs: [typeDef, user.typeDef, post.typeDef, comments.typeDef],
    resolvers: (0, merge_1.default)(resolvers, user.resolvers, post.resolvers, comments.resolvers),
});
exports.default = schema;
