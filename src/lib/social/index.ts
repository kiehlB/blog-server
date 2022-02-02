import { google } from 'googleapis';

export type SocialProvider = 'facebook' | 'github' | 'google';

const { GITHUB_CLIENT_ID } = process.env;

// https://www.woongblog.xyz/social
const redirectPath = `/api/v2/auth/callback/`;
export const redirectUri = `https://www.woongblog.xyz${redirectPath}`;

export function generateSocialLoginLink(provider: SocialProvider, next: string = '/') {
  const generators = {
    github(next: string) {
      const redirectUriWithNext = `${redirectUri}github?next=${next}`;
      return `https://github.com/login/oauth/authorize?scope=user:email&client_id=${GITHUB_CLIENT_ID}&redirect_uri=${redirectUriWithNext}`;
    },
  };

  const generator = generators[provider];
  return generator(encodeURI(next));
}

export type SocialProfile = {
  uid: number | string;
  thumbnail: string | null;
  email: string | null;
  name: string;
  username?: string;
};
