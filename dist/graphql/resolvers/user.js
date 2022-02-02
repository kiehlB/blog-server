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
const apollo_server_express_1 = require("apollo-server-express");
const User_1 = __importDefault(require("../../entity/User"));
const typeorm_1 = require("typeorm");
const bcrypt_1 = __importDefault(require("bcrypt"));
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const authcheck_1 = require("../../lib/authcheck");
const token_1 = require("../../lib/token");
const Following_1 = __importDefault(require("../../entity/Following"));
const Followers_1 = __importDefault(require("../../entity/Followers"));
const UserProfile_1 = __importDefault(require("../../entity/UserProfile"));
exports.typeDef = (0, graphql_tag_1.default) `
  type User {
    id: String
    username: String
    email: String
    password: String
    email_verified: Boolean
    tokenVersion: String
    profile: UserProfile
    auth: [User]
    follower: Followers
    accessToken: String
    refreshToken: String
    created_at: String
  }
  type UserProfile {
    id: String
    bio: String
    user_id: String
  }
  type Followers {
    id: String
    user_id: String
    follower_id: String
  }
  type Following {
    id: String
    user_id: String
    following_id: String
  }
`;
const comparePassword = (credentialsPassword, userPassword) => __awaiter(void 0, void 0, void 0, function* () {
    const isPasswordMatch = yield bcrypt_1.default.compare(credentialsPassword, userPassword);
    return isPasswordMatch;
});
exports.resolvers = {
    User: {
        profile: (parent, _, { loaders }) => __awaiter(void 0, void 0, void 0, function* () {
            return loaders.userProfile.load(parent.id);
        }),
        follower: (parent, _, { loaders }) => __awaiter(void 0, void 0, void 0, function* () {
            return loaders.follower.load(parent.id);
        }),
    },
    Query: {
        me: (_, __, { req, res }) => {
            if (!res.locals.user_id) {
                return null;
            }
            const users = (0, typeorm_1.getRepository)(User_1.default);
            return users.findOne({ id: res.locals.user_id });
        },
        users: () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const user = (0, typeorm_1.getRepository)(User_1.default);
                const users = yield user.find();
                return users;
            }
            catch (err) {
                console.log(err);
            }
        }),
        user: (_, { id, username }) => __awaiter(void 0, void 0, void 0, function* () {
            const users = (0, typeorm_1.getRepository)(User_1.default);
            try {
                if (username) {
                    const user = yield users.findOne({
                        where: {
                            username,
                        },
                    });
                    return user;
                }
                const user = yield users.findOne({
                    id,
                });
                return user;
            }
            catch (e) {
                console.log(e);
            }
        }),
    },
    Mutation: {
        login: (_, { email, password }, { res }) => __awaiter(void 0, void 0, void 0, function* () {
            const users = (0, typeorm_1.getRepository)(User_1.default);
            try {
                yield authcheck_1.schemaLogin.validateAsync({ email, password }, { abortEarly: false });
            }
            catch (err) {
                return err;
            }
            const user = yield users.findOne({
                where: {
                    email: email,
                },
            });
            if (!user) {
                throw new apollo_server_express_1.UserInputError('user not exist', {
                    errors: {
                        email: 'user not exist',
                    },
                });
            }
            // if (!user.email_verified) {
            //   throw new UserInputError('need to email confirmed', {
            //     errors: {
            //       email: 'need to email confirmed'
            //     }
            //   });
            // }
            const isPasswordValid = yield comparePassword(password, user.password);
            if (!isPasswordValid) {
                throw new apollo_server_express_1.UserInputError('password not validation', {
                    errors: {
                        password: 'password not validation',
                    },
                });
            }
            const tokens = yield user.generateUserToken();
            (0, token_1.setTokenCookie)(res, tokens);
            try {
                const result = yield user;
                return {
                    id: result.id,
                    username: result.username,
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                };
            }
            catch (ex) {
                throw ex;
            }
        }),
        register: (_, { email, username, password }, { res }) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                yield authcheck_1.schema.validateAsync({ username, email, password }, { abortEarly: false });
            }
            catch (err) {
                return err;
            }
            const users = (0, typeorm_1.getRepository)(User_1.default);
            const user = yield users.findOne({
                where: {
                    email: email,
                },
            });
            if (user) {
                throw new apollo_server_express_1.UserInputError('user already exist', {
                    errors: {
                        username: 'user already exist',
                    },
                });
            }
            password = yield bcrypt_1.default.hash(password, 12);
            const newUser = new User_1.default();
            newUser.email = email;
            newUser.username = username;
            newUser.password = password;
            yield users.save(newUser);
            return newUser;
        }),
        createProfile: (_, { bio }, { req, res }) => __awaiter(void 0, void 0, void 0, function* () {
            if (!res.locals.user_id) {
                throw new apollo_server_express_1.AuthenticationError('plz Loginin');
            }
            const userProfile = (0, typeorm_1.getRepository)(UserProfile_1.default);
            const newBio = new UserProfile_1.default();
            newBio.bio = bio;
            newBio.user_id = res.locals.user_id;
            yield userProfile.save(newBio);
            return newBio;
        }),
        updateProfile: (_, bio, { req, res }) => __awaiter(void 0, void 0, void 0, function* () {
            if (!res.locals.user_id) {
                throw new apollo_server_express_1.AuthenticationError('plz Loginin');
            }
            const userProfile = (0, typeorm_1.getRepository)(UserProfile_1.default);
            const profile = yield userProfile.findOne({
                where: {
                    user_id: res.locals.user_id,
                },
            });
            if (!profile) {
                throw new apollo_server_express_1.ApolloError('Something went wrong');
            }
            Object.assign(profile, bio);
            yield userProfile.save(profile);
            return profile;
        }),
        revokeRefreshToken: (_, args, { req, res }) => __awaiter(void 0, void 0, void 0, function* () {
            if (!res.locals.user_id) {
                return false;
            }
            yield (0, typeorm_1.getConnection)()
                .getRepository(User_1.default)
                .increment({ id: args.userId }, 'tokenVersion', 1);
            return true;
        }),
        followUser: (_, args, { req, res }) => __awaiter(void 0, void 0, void 0, function* () {
            if (!res.locals.user_id) {
                throw new apollo_server_express_1.AuthenticationError('plz Loginin');
            }
            const findUser = (0, typeorm_1.getRepository)(User_1.default);
            const follower = (0, typeorm_1.getRepository)(Followers_1.default);
            const following = (0, typeorm_1.getRepository)(Following_1.default);
            const userToFollow = yield findUser.findOne({
                where: {
                    username: args.username,
                },
            });
            if (userToFollow.id === res.locals.user_id) {
                throw new apollo_server_express_1.ApolloError("You can't follow yourself");
            }
            // const alreadyFollowed = await follower.findOne({
            //   where: {
            //     follower_id: res.locals.user_id,
            //     user_id: userToFollow!.id,
            //   },
            // });
            // if (alreadyFollowed) {
            //   throw new ApolloError("You're already following this user");
            // }
            const FollowingUser = new Following_1.default();
            FollowingUser.following_id = userToFollow.id;
            FollowingUser.user_id = res.locals.user_id;
            const createFollowing = following.save(FollowingUser);
            const FollowerUser = new Followers_1.default();
            FollowerUser.follower_id = res.locals.user_id;
            FollowerUser.user_id = userToFollow.id;
            const createFollower = follower.save(FollowerUser);
            yield Promise.all([createFollowing, createFollower]);
            return FollowerUser;
        }),
        unFollowUser: (_, args, { req, res }) => __awaiter(void 0, void 0, void 0, function* () {
            if (!res.locals.user_id) {
                throw new apollo_server_express_1.AuthenticationError('plz Loginin');
            }
            const findUser = (0, typeorm_1.getRepository)(User_1.default);
            const follower = (0, typeorm_1.getRepository)(Followers_1.default);
            const following = (0, typeorm_1.getRepository)(Following_1.default);
            const unUserToFollow = yield findUser.findOne({
                where: {
                    username: args.username,
                },
            });
            if (unUserToFollow.id === res.locals.user_id) {
                throw new apollo_server_express_1.ApolloError("You can't unfollow yourself");
            }
            const unFollowingUser = following
                .createQueryBuilder()
                .delete()
                .where('user_id = :userId', { userId: res.locals.user_id })
                .andWhere('following_id = :followingId', {
                followingId: unUserToFollow.id,
            })
                .execute();
            const unFollowerUser = follower
                .createQueryBuilder()
                .delete()
                .where('user_id = :userId', { userId: unUserToFollow.id })
                .andWhere('follower_id = :followerId', {
                followerId: res.locals.user_id,
            })
                .execute();
            yield Promise.all([unFollowingUser, unFollowerUser]);
            return unUserToFollow;
        }),
        logout: (_, args, { res }) => __awaiter(void 0, void 0, void 0, function* () {
            const accessToken = '';
            const refreshToken = '';
            const token = {
                accessToken,
                refreshToken,
            };
            (0, token_1.setTokenCookie)(res, token);
            return true;
        }),
    },
};
