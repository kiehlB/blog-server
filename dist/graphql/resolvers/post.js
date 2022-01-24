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
exports.resolvers = exports.saveTags = exports.findTag = exports.typeDef = void 0;
const apollo_server_express_1 = require("apollo-server-express");
const typeorm_1 = require("typeorm");
const Post_1 = __importDefault(require("../../entity/Post"));
const PostLike_1 = __importDefault(require("../../entity/PostLike"));
const PostScore_1 = __importDefault(require("../../entity/PostScore"));
const PostReadLog_1 = __importDefault(require("../../entity/PostReadLog"));
const PostsTags_1 = __importDefault(require("../../entity/PostsTags"));
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const cloudinary_1 = require("../../lib/cloudinary");
const checkString_1 = require("../../lib/checkString");
const crypto_1 = __importDefault(require("../../lib/crypto"));
exports.typeDef = (0, graphql_tag_1.default) `
  scalar Date
  type TransformImageOptionsInput {
    width: Int
    height: Int
    crop: String
  }

  type Post {
    id: String
    title: String
    body: String
    thumbnail: String
    likes: Int
    views: Int
    url: String!
    user: User
    released_at: Date
    created_at: Date
    updated_at: Date
    comments: [PostComment]
    name: String
    tags: Tag
    post_id: String
    liked: Boolean
    hasMore: Boolean
    endCursor: String
  }

  type UploadOptionsInput {
    public_id: String
    folder: String
    use_filename: Boolean
    unique_filename: Boolean
    resource_type: String
    type: String
    access_mode: String
    discard_original_filename: Boolean
    overwrite: Boolean
    tags: [TagInput]
    colors: Boolean
    faces: Boolean
    quality_analysis: Boolean
    cinemegraph_analysis: Boolean
    image_metadata: Boolean
    phash: Boolean
    auto_tagging: Boolean
    categorization: [CategoryInput]
  }
  type CategoryInput {
    name: String
  }
  type TagInput {
    tag_name: String!
  }
  type Tag {
    name: String!
  }
  type UploadedImage {
    public_id: String!
    version: String!
    width: Int!
    height: Int!
    format: String!
    created_at: String!
    resource_type: String!
    tags: [Tag]!
    bytes: Int!
    type: String!
    etag: String!
    url: String!
    secure_url: String!
    signature: String!
    original_filename: String!
  }
  type ImageUrl {
    public_id: [String]
    url: String
  }
  type PostComment {
    id: String!
    text: String
    likes: Int
    has_replies: Boolean
    deleted: Boolean
    user: User
    post_id: String
    reply: String
    replies: [PostComment]
    comment: String
  }
`;
const findTag = (name) => __awaiter(void 0, void 0, void 0, function* () {
    const getTag = (0, typeorm_1.getRepository)(PostsTags_1.default);
    const findOneTag = getTag.findOne({
        name,
    });
    const findTagOne = yield findOneTag;
    if ((findTagOne === null || findTagOne === void 0 ? void 0 : findTagOne.name) == name) {
        return null;
    }
    else {
        const returnName = escape(name).toLowerCase();
        return returnName;
    }
});
exports.findTag = findTag;
const saveTags = (name) => __awaiter(void 0, void 0, void 0, function* () { });
exports.saveTags = saveTags;
exports.resolvers = {
    Post: {
        user: (parent, __, { loaders }) => {
            if (!parent.user) {
                return loaders.user.load(parent.id);
            }
            return parent.user;
        },
        comments: (parent, _, { loaders }) => {
            if (parent.comments)
                return parent.comments;
            return loaders.comments.load(parent.id);
        },
        liked: (parent, args, { req, res }) => __awaiter(void 0, void 0, void 0, function* () {
            const getPostLike = (0, typeorm_1.getRepository)(PostLike_1.default);
            if (!res.locals.user_id)
                return false;
            const liked = yield getPostLike.findOne({
                post_id: parent.id,
                user_id: res.locals.user_id,
            });
            return !!liked;
        }),
        tags: (parent, __, { loaders }) => __awaiter(void 0, void 0, void 0, function* () {
            return loaders.tags.load(parent.id);
        }),
    },
    Query: {
        getImageUrl: (_, __, { req }) => __awaiter(void 0, void 0, void 0, function* () {
            const { resources } = yield cloudinary_1.cloudinary.search
                .expression('folder:woong')
                .sort_by('public_id', 'desc')
                .max_results(200)
                .execute();
            const publicIds = resources.map((file) => file.public_id);
            return {
                public_id: publicIds,
            };
        }),
        post: (_, args, { req }) => __awaiter(void 0, void 0, void 0, function* () {
            const findPost = yield (0, typeorm_1.getManager)()
                .createQueryBuilder(Post_1.default, 'post')
                .where('post.id = :id', { id: args.id })
                .leftJoinAndSelect('post.user', 'user')
                .getOne();
            return findPost;
        }),
        posts: (_, { cursor, after }, { req }, { limit = 3 }) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const query = yield (0, typeorm_1.getManager)()
                    .createQueryBuilder(Post_1.default, 'post')
                    .limit(limit)
                    .orderBy('post.released_at', 'DESC')
                    .addOrderBy('post.id', 'DESC')
                    .leftJoinAndSelect('post.user', 'user');
                // let first = 5;
                // if (limit !== undefined) {
                //   const min = 1;
                //   const max = 25;
                //   if (limit < min || limit > max) {
                //     throw new ApolloError(`Invalid limit value (min: ${min}, max: ${max})`);
                //   }
                //   first = limit;
                // }
                // if (after) {
                //   if (limit !== undefined) {
                //     const index = posts.findIndex(item => item.id === after);
                //     if (index === -1) {
                //       throw new ApolloError(`Invalid after value: cursor not found.`);
                //     }
                //     after = index + 1;
                //     if (after === posts.length) {
                //       throw new ApolloError(
                //         `Invalid after value: no items after provided cursor.`,
                //       );
                //     }
                //   }
                // }
                // const pageInfoPost = posts.slice(after, after + first);
                // const lastName = pageInfoPost[pageInfoPost.length - 1];
                if (cursor) {
                    const post = yield (0, typeorm_1.getRepository)(Post_1.default).findOne({
                        id: cursor,
                    });
                    if (!post) {
                        throw new apollo_server_express_1.ApolloError('invalid cursor');
                    }
                    query.andWhere('post.released_at < :date', {
                        date: post.released_at,
                        id: post.id,
                    });
                    query.orWhere('post.released_at = :date AND post.id < :id', {
                        date: post.released_at,
                        id: post.id,
                    });
                }
                const posts = yield query.getMany();
                return posts;
            }
            catch (err) {
                throw Error(err);
            }
        }),
        topFivePost: (parent, { offset = 0, limit = 5 }) => __awaiter(void 0, void 0, void 0, function* () {
            const rows = (yield (0, typeorm_1.getManager)().query(`
        select posts.id, posts.title, SUM(score) as score  from post_scores
        inner join posts on post_scores.post_id = posts.id
        group by posts.id
        order by score desc, posts.id desc
        offset $1
        limit $2
      `, [offset, limit]));
            const ids = rows.map(row => row.id);
            const posts = yield (0, typeorm_1.getRepository)(Post_1.default).findByIds(ids);
            if (rows == []) {
                return rows;
            }
            else {
                const Postrows = (yield (0, typeorm_1.getManager)().query(`
          select * from posts
          offset $1
          limit $2
        `, [offset, limit]));
                const getPost = (0, typeorm_1.getRepository)(Post_1.default);
                const Posts = yield getPost.find({
                    order: {
                        created_at: 'DESC',
                    },
                });
                return Posts;
            }
        }),
    },
    Mutation: {
        createPost: (_, args, { req, res }) => __awaiter(void 0, void 0, void 0, function* () {
            const getPost = (0, typeorm_1.getRepository)(Post_1.default);
            const postTags = (0, typeorm_1.getRepository)(PostsTags_1.default);
            if (!res.locals.user_id) {
                throw new apollo_server_express_1.AuthenticationError('plz login');
            }
            const { tags, title, body, thumbnail } = args;
            const post = new Post_1.default();
            if ((0, checkString_1.checkEmpty)(title)) {
                throw new apollo_server_express_1.ApolloError('Title is empty');
            }
            post.user_id = res.locals.user_id;
            post.title = title;
            post.body = body;
            post.thumbnail = thumbnail;
            yield getPost.save(post);
            if (tags) {
                const postTag = new PostsTags_1.default();
                const tagsData = yield (0, exports.findTag)(tags);
                if (tagsData) {
                    postTag.post_id = post.id;
                    postTag.name = tagsData;
                    yield postTags.save(postTag);
                }
            }
            return post;
        }),
        uploadImage: (_, args) => __awaiter(void 0, void 0, void 0, function* () {
            const fileStr = args.body;
            const uploadResponse = yield cloudinary_1.cloudinary.uploader.upload(fileStr, {
                folder: 'woong',
                width: 720,
                height: 487,
                crop: 'scale',
            });
            return uploadResponse;
        }),
        editPost: (_, args, { req, res }) => __awaiter(void 0, void 0, void 0, function* () {
            if (!res.locals.user_id) {
                throw new apollo_server_express_1.AuthenticationError('plz login');
            }
            const { post_id, title, body, thumbnail } = args;
            const getPost = (0, typeorm_1.getRepository)(Post_1.default);
            const post = yield getPost.findOne({
                where: {
                    id: post_id,
                },
            });
            if (!post) {
                throw new apollo_server_express_1.ApolloError('Post not found');
            }
            if (post.user_id !== res.locals.user_id) {
                throw new apollo_server_express_1.ApolloError('this is not yours');
            }
            post.title = title;
            post.body = body;
            post.thumbnail = thumbnail;
            Object.assign(post, args);
            yield getPost.save(post);
            return post;
        }),
        removePost: (_, args, { req, res }) => __awaiter(void 0, void 0, void 0, function* () {
            if (!res.locals.user_id) {
                throw new apollo_server_express_1.AuthenticationError('plz login');
            }
            const getPost = (0, typeorm_1.getRepository)(Post_1.default);
            const post = yield getPost.findOne({
                where: {
                    id: args.post_id,
                },
            });
            if (!post) {
                throw new apollo_server_express_1.ApolloError('Post not found');
            }
            if (post.user_id !== res.locals.user_id) {
                throw new apollo_server_express_1.ApolloError('This is not your post');
            }
            yield getPost.remove(post);
            return true;
        }),
        likePost: (_, args, { req, res }) => __awaiter(void 0, void 0, void 0, function* () {
            if (!res.locals.user_id) {
                throw new apollo_server_express_1.AuthenticationError('plz login');
            }
            const getPost = (0, typeorm_1.getRepository)(Post_1.default);
            const getLikePost = (0, typeorm_1.getRepository)(PostLike_1.default);
            const getPostScore = (0, typeorm_1.getRepository)(PostScore_1.default);
            const post = yield getPost.findOne({
                where: {
                    id: args.id,
                },
            });
            if (!post) {
                throw new apollo_server_express_1.ApolloError('Post not found');
            }
            const alreadyLiked = yield getLikePost.findOne({
                where: {
                    post_id: args.id,
                    user_id: res.locals.user_id,
                },
            });
            if (alreadyLiked) {
                throw new apollo_server_express_1.ApolloError('you already liked post');
            }
            const postLike = new PostLike_1.default();
            postLike.post_id = args.id;
            postLike.user_id = res.locals.user_id;
            try {
                yield getLikePost.save(postLike);
            }
            catch (e) {
                return post;
            }
            const count = yield getLikePost.count({
                where: {
                    post_id: args.id,
                },
            });
            post.likes = count;
            yield getPost.save(post);
            const score = new PostScore_1.default();
            score.type = 'LIKE';
            score.post_id = args.id;
            score.score = 5;
            score.user_id = res.locals.user_id;
            yield getPostScore.save(score);
            return post;
        }),
        unLikePost: (_, args, { req, res }) => __awaiter(void 0, void 0, void 0, function* () {
            if (!res.locals.user_id) {
                throw new apollo_server_express_1.AuthenticationError('plz login');
            }
            const getPost = (0, typeorm_1.getRepository)(Post_1.default);
            const getLikePost = (0, typeorm_1.getRepository)(PostLike_1.default);
            const getPostScore = (0, typeorm_1.getRepository)(PostScore_1.default);
            const post = yield getPost.findOne({
                where: {
                    id: args.id,
                },
            });
            if (!post) {
                throw new apollo_server_express_1.ApolloError('Post not found');
            }
            const postLike = yield getLikePost.findOne({
                where: {
                    post_id: args.id,
                    user_id: res.locals.user_id,
                },
            });
            if (!postLike) {
                return post;
            }
            yield getLikePost.remove(postLike);
            const count = yield getLikePost.count({
                where: {
                    post_id: args.id,
                },
            });
            post.likes = count;
            yield getPost.save(post);
            yield getPostScore
                .createQueryBuilder()
                .delete()
                .where('post_id = :postId', { postId: args.id })
                .andWhere('user_id = :userId', { userId: res.locals.user_id })
                .andWhere("type = 'LIKE'")
                .execute();
            return post;
        }),
        postView: (_, args, { req }) => __awaiter(void 0, void 0, void 0, function* () {
            const postRead = (0, typeorm_1.getRepository)(PostReadLog_1.default);
            const ipHash = (0, crypto_1.default)(req.ip);
            const viewed = yield postRead
                .createQueryBuilder('post_read')
                .where('ip = :ip', { ipHash })
                .andWhere('post_id = :postId', { postId: args.id })
                .andWhere("created_at > (NOW() - INTERVAL '24 HOURS')")
                .getOne();
            if (viewed)
                return false;
            const postReads = new PostReadLog_1.default();
            postReads.post_id = args.id;
            postReads.user_id = req.user_Id;
            postReads.ip = ipHash;
            yield postRead.save(postReads);
            const getPost = (0, typeorm_1.getRepository)(Post_1.default);
            yield getPost
                .createQueryBuilder()
                .update()
                .set({
                views: () => 'views + 1',
            })
                .where('id = :id', { id: args.id })
                .execute();
            const post = yield getPost.findOne(args.id);
            if (!post)
                return false;
            const postScoreRepo = (0, typeorm_1.getRepository)(PostScore_1.default);
            const score = new PostScore_1.default();
            score.post_id = args.id;
            score.type = 'READ';
            score.score = 0.25;
            yield postScoreRepo.save(score);
            return true;
        }),
    },
};
