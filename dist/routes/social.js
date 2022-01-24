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
exports.socialRegister = exports.socialRedirect = exports.githubCallback = exports.socialCallback = void 0;
const typeorm_1 = require("typeorm");
const SocialUser_1 = __importDefault(require("../entity/SocialUser"));
const User_1 = __importDefault(require("../entity/User"));
const social_1 = require("../lib/social");
const github_1 = require("../lib/social/github");
const token_1 = require("../lib/token");
const UserProfile_1 = __importDefault(require("../entity/UserProfile"));
const prod = process.env.NODE_ENV === 'production'
    ? 'http://www.woongblog.xzy'
    : 'http://localhost:3000';
function getSocialAccount(params) {
    return __awaiter(this, void 0, void 0, function* () {
        const socialAccountRepo = (0, typeorm_1.getRepository)(SocialUser_1.default);
        const socialAccount = yield socialAccountRepo.findOne({
            where: {
                social_id: params.uid.toString(),
                provider: params.provider,
            },
        });
        return socialAccount;
    });
}
const socialCallback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { profile, socialAccount, accessToken, provider } = res.locals;
        if (!profile || !accessToken)
            return;
        // SocialAccount already exists in db
        const userRepo = (0, typeorm_1.getRepository)(User_1.default);
        if (socialAccount) {
            // login process
            const user = yield userRepo.findOne(socialAccount.user_id);
            if (!user) {
                throw new Error('User is missing');
            }
            const tokens = yield (0, token_1.createTokens)(user);
            (0, token_1.setTokenCookie)(res, tokens);
            const redirectUrl = prod;
            const state = req.query.state
                ? JSON.parse(req.query.state)
                : null;
            const next = req.query.next || (state === null || state === void 0 ? void 0 : state.next) || '/';
            res.redirect(encodeURI(redirectUrl.concat(next)));
            return;
        }
        // Find by email ONLY when email exists
        let user = undefined;
        if (profile.email) {
            user = yield userRepo.findOne({
                email: profile.email,
            });
        }
        // Email exists -> Login
        if (user) {
            const tokens = yield (0, token_1.createTokens)(user);
            (0, token_1.setTokenCookie)(req, tokens);
            const redirectUrl = prod;
            res.redirect(encodeURI(redirectUrl));
            console.log(encodeURI(redirectUrl));
            return;
        }
        // Register new social account
        const registerTokenInfo = {
            profile,
            accessToken,
            provider,
        };
        const registerToken = yield (0, token_1.generateToken)(registerTokenInfo, {
            expiresIn: '1h',
        });
        res.cookie('register_token', registerToken, {
            maxAge: 1000 * 60 * 60,
        });
        const redirectUrl = `${`${prod}/social`}`;
        res.redirect(encodeURI(redirectUrl));
    }
    catch (e) {
        throw new Error('error');
    }
});
exports.socialCallback = socialCallback;
const githubCallback = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { code } = req.query;
    if (!code) {
        req.status = 400;
        return;
    }
    try {
        const accessToken = yield (0, github_1.getGithubAccessToken)({
            code,
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
        });
        const profile = yield (0, github_1.getGithubProfile)(accessToken);
        const socialAccount = yield getSocialAccount({
            uid: profile.uid,
            provider: 'github',
        });
        res.locals.profile = profile;
        res.locals.socialAccount = socialAccount;
        res.locals.accessToken = accessToken;
        res.locals.provider = 'github';
        return next();
    }
    catch (e) {
        console.log(e);
    }
});
exports.githubCallback = githubCallback;
const socialRedirect = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { provider } = req.params;
    const { next } = req.query;
    const validated = ['facebook', 'google', 'github'].includes(provider);
    if (!validated) {
        res.status = 400;
        return;
    }
    const loginUrl = (0, social_1.generateSocialLoginLink)(provider, next);
    res.redirect(loginUrl);
});
exports.socialRedirect = socialRedirect;
const socialRegister = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // check token existancy
    const registerToken = req.cookies['register_token'];
    if (!registerToken) {
        res.status = 401;
        return;
    }
    const { profileName, username, bio } = req.body;
    let decoded = null;
    try {
        decoded = yield (0, token_1.validateRefreshToken)(registerToken);
    }
    catch (e) {
        // failed to decode token
        res.status = 401;
        return;
    }
    const email = decoded.profile.email;
    try {
        const userRepo = (0, typeorm_1.getRepository)(User_1.default);
        // check duplicates
        const exists = yield userRepo
            .createQueryBuilder()
            .where('username = :username', { username })
            .orWhere('email = :email AND email != null', { email })
            .getOne();
        if (exists) {
            res.status = 409;
            res.body = {
                name: 'ALREADY_EXISTS',
                payload: email === exists.email ? 'email' : 'username',
            };
            return;
        }
        const userProfileRepo = (0, typeorm_1.getRepository)(UserProfile_1.default);
        // create user
        const user = new User_1.default();
        user.email = email;
        user.username = username;
        yield userRepo.save(user);
        // create social account
        const socialAccount = new SocialUser_1.default();
        socialAccount.access_token = decoded.accessToken;
        socialAccount.provider = decoded.provider;
        socialAccount.user_id = user.id;
        socialAccount.social_id = decoded.profile.uid.toString();
        const socialAccountRepo = (0, typeorm_1.getRepository)(SocialUser_1.default);
        yield socialAccountRepo.save(socialAccount);
        // create profile
        const profile = new UserProfile_1.default();
        profile.user_id = user.id;
        profile.profile_name = profileName;
        profile.bio = bio;
        yield userProfileRepo.save(profile);
        const tokens = yield user.generateUserToken();
        (0, token_1.setTokenCookie)(res, tokens);
        req.body = Object.assign(Object.assign({}, user), { profile, tokens: {
                access_token: tokens.accessToken,
                refresh_token: tokens.refreshToken,
            } });
    }
    catch (e) {
        console.log(e);
    }
});
exports.socialRegister = socialRegister;
