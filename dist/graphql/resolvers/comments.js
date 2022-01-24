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
exports.resolvers = exports.typeDef = void 0;
const apollo_server_1 = require("apollo-server");
const typeorm_1 = require("typeorm");
const Post_1 = __importDefault(require("../../entity/Post"));
const Comment_1 = __importDefault(require("../../entity/Comment"));
const graphql_tag_1 = __importDefault(require("graphql-tag"));
exports.typeDef = (0, graphql_tag_1.default) `
  type Comment {
    id: String
    text: String
    likes: Int
    has_replies: Boolean
    deleted: Boolean
    user: User
    post_id: String
    reply: String
    replies: [Comment]
    comment: String
  }
`;
exports.resolvers = {
    Comment: {
        user: (parent, _, { loaders }) => {
            if (parent.deleted) {
                return null;
            }
            if (parent.user)
                return parent.user;
            const user = loaders.user.load(parent.user_id);
            return user;
        },
        replies: (parent, args) => __awaiter(void 0, void 0, void 0, function* () {
            if (!parent.has_replies)
                return [];
            const comments = yield (0, typeorm_1.getRepository)(Comment_1.default).find({
                where: {
                    reply: parent.id,
                    deleted: false,
                },
                order: {
                    created_at: 'ASC',
                },
            });
            return comments;
        }),
    },
    Query: {
        comment: (parent, { __ }) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const comment = yield (0, typeorm_1.getRepository)(Comment_1.default);
                const getComments = yield comment.find({
                    order: {
                        created_at: 'ASC',
                    },
                });
                return getComments;
            }
            catch (err) {
                throw Error(err);
            }
        }),
        subcomments: (parent, { comment_id }) => __awaiter(void 0, void 0, void 0, function* () {
            const comments = yield (0, typeorm_1.getRepository)(Comment_1.default).find({
                where: {
                    reply: comment_id,
                },
                order: {
                    created_at: 'ASC',
                },
            });
            return comments;
        }),
    },
    Mutation: {
        createComment: (_, args, { req, res }) => __awaiter(void 0, void 0, void 0, function* () {
            const getPost = (0, typeorm_1.getRepository)(Post_1.default);
            const getComment = (0, typeorm_1.getRepository)(Comment_1.default);
            const comment = new Comment_1.default();
            if (!res.locals.user_id) {
                throw new apollo_server_1.AuthenticationError('plz login');
            }
            const post = yield getPost.findOne({
                where: {
                    id: args.post_id,
                },
            });
            if (!post) {
                throw new apollo_server_1.ApolloError('Post not found');
            }
            if (args.comment_id) {
                const commentReply = yield getComment.findOne(args.comment_id);
                if (!commentReply) {
                    throw new apollo_server_1.ApolloError("there's no comment");
                }
                comment.reply = args.comment_id;
                commentReply.has_replies = true;
                yield getComment.save(commentReply);
            }
            comment.user_id = res.locals.user_id;
            comment.text = args.text;
            comment.post_id = args.post_id;
            yield getComment.save(comment);
            return comment;
        }),
        removeComment: (_, args, { req, res }) => __awaiter(void 0, void 0, void 0, function* () {
            if (!res.locals.user_id) {
                throw new apollo_server_1.AuthenticationError('plz login');
            }
            const getComment = (0, typeorm_1.getRepository)(Comment_1.default);
            const comment = yield getComment.findOne(args.id);
            if (!comment) {
                throw new apollo_server_1.ApolloError('Comment not found');
            }
            if (res.locals.user_id !== comment.user_id) {
                throw new apollo_server_1.ApolloError('This is not your comment');
            }
            comment.deleted = true;
            yield getComment.remove(comment);
            // const getPostScore = getRepository(PostScore);
            // const CommentScore = await getPostScore
            //   .createQueryBuilder()
            //   .where('post_id = :postId', { postId: comment.post_id })
            //   .andWhere('user_id = :userId', { userId: res.locals.user_id })
            //   .andWhere("type = 'COMMENT'")
            //   .orderBy('created_at', 'DESC')
            //   .getOne();
            // await getPostScore.delete(CommentScore!.id);
            return true;
        }),
        editComment: (_, args, { req, res }) => __awaiter(void 0, void 0, void 0, function* () {
            if (!res.locals.user_id) {
                throw new apollo_server_1.AuthenticationError('plz login');
            }
            const getComment = (0, typeorm_1.getRepository)(Comment_1.default);
            const comment = yield getComment.findOne(args.id);
            if (!comment) {
                throw new apollo_server_1.ApolloError('Comment not found');
            }
            comment.text = args.text;
            yield getComment.save(comment);
            return comment;
        }),
    },
};
