"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSocialLoginLink = exports.redirectUri = void 0;
const { GITHUB_CLIENT_ID } = process.env;
const redirectPath = `/api/v2/auth/callback/`;
exports.redirectUri = `http://localhost:4000${redirectPath}`;
function generateSocialLoginLink(provider, next = '/') {
    const generators = {
        github(next) {
            const redirectUriWithNext = `${exports.redirectUri}github?next=${next}`;
            return `https://github.com/login/oauth/authorize?scope=user:email&client_id=${GITHUB_CLIENT_ID}&redirect_uri=${redirectUriWithNext}`;
        },
    };
    const generator = generators[provider];
    return generator(encodeURI(next));
}
exports.generateSocialLoginLink = generateSocialLoginLink;
