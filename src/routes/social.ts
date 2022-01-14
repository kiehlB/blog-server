import { getRepository } from 'typeorm';
import SocialUser from '../entity/SocialUser';
import User from '../entity/User';
import { generateSocialLoginLink } from '../lib/social';
import { getGithubAccessToken, getGithubProfile } from '../lib/social/github';
import {
  createTokens,
  generateToken,
  setTokenCookie,
  validateRefreshToken,
} from '../lib/token';
import UserProfile from '../entity/UserProfile';

async function getSocialAccount(params: { uid: number | string; provider }) {
  const socialAccountRepo = getRepository(SocialUser);

  const socialAccount = await socialAccountRepo.findOne({
    where: {
      social_id: params.uid.toString(),
      provider: params.provider,
    },
  });

  return socialAccount;
}

export const socialCallback = async (req, res) => {
  try {
    const { profile, socialAccount, accessToken, provider } = res.locals as {
      profile;
      socialAccount;
      accessToken;
      provider;
    };

    if (!profile || !accessToken) return;
    // SocialAccount already exists in db
    const userRepo = getRepository(User);
    if (socialAccount) {
      // login process
      const user = await userRepo.findOne(socialAccount.user_id);
      if (!user) {
        throw new Error('User is missing');
      }

      const tokens = await createTokens(user);

      setTokenCookie(res, tokens);
      const redirectUrl = 'http://localhost:3000';

      const state = req.query.state
        ? (JSON.parse(req.query.state) as { next: string })
        : null;
      const next = req.query.next || state?.next || '/';

      res.redirect(encodeURI(redirectUrl.concat(next)));
      return;
    }

    // Find by email ONLY when email exists
    let user: User | undefined = undefined;
    if (profile.email) {
      user = await userRepo.findOne({
        email: profile.email,
      });
    }

    // Email exists -> Login
    if (user) {
      const tokens = await createTokens(user);
      setTokenCookie(req, tokens);
      const redirectUrl = 'https://localhost:3000';

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

    const registerToken = await generateToken(registerTokenInfo, {
      expiresIn: '1h',
    });

    res.cookie('register_token', registerToken, {
      maxAge: 1000 * 60 * 60,
    });

    const redirectUrl = 'http://localhost:3000/social';
    res.redirect(encodeURI(redirectUrl));
  } catch (e) {
    throw new Error('error');
  }
};

export const githubCallback = async (req, res, next) => {
  const { code }: { code?: string } = req.query;
  if (!code) {
    req.status = 400;
    return;
  }

  try {
    const accessToken = await getGithubAccessToken({
      code,
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    });

    const profile = await getGithubProfile(accessToken);

    const socialAccount = await getSocialAccount({
      uid: profile.uid,
      provider: 'github',
    });

    res.locals.profile = profile;
    res.locals.socialAccount = socialAccount;
    res.locals.accessToken = accessToken;
    res.locals.provider = 'github';
    return next();
  } catch (e) {
    console.log(e);
  }
};

export const socialRedirect = async (req, res) => {
  const { provider } = req.params;

  const { next } = req.query;
  const validated = ['facebook', 'google', 'github'].includes(provider);
  if (!validated) {
    res.status = 400;
    return;
  }

  const loginUrl = generateSocialLoginLink(provider, next);

  res.redirect(loginUrl);
};

export const socialRegister = async (req, res) => {
  // check token existancy

  const registerToken = req.cookies['register_token'];
  if (!registerToken) {
    res.status = 401;
    return;
  }

  type RequestBody = {
    profileName: string;
    username: string;
    bio: string;
  };
  const { profileName, username, bio }: RequestBody = req.body;

  let decoded = null;
  try {
    decoded = await validateRefreshToken(registerToken);
  } catch (e) {
    // failed to decode token
    res.status = 401;
    return;
  }

  const email = decoded.profile.email;

  try {
    const userRepo = getRepository(User);
    // check duplicates
    const exists = await userRepo
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

    const userProfileRepo = getRepository(UserProfile);

    // create user
    const user = new User();
    user.email = email;
    user.username = username;
    await userRepo.save(user);

    // create social account
    const socialAccount = new SocialUser();
    socialAccount.access_token = decoded.accessToken;
    socialAccount.provider = decoded.provider;
    socialAccount.user_id = user.id;
    socialAccount.social_id = decoded.profile.uid.toString();

    const socialAccountRepo = getRepository(SocialUser);
    await socialAccountRepo.save(socialAccount);

    // create profile
    const profile = new UserProfile();
    profile.user_id = user.id;
    profile.profile_name = profileName;
    profile.bio = bio;

    await userProfileRepo.save(profile);
    const tokens = await user.generateUserToken();
    setTokenCookie(res, tokens);

    req.body = {
      ...user,
      profile,
      tokens: {
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      },
    };
  } catch (e) {
    console.log(e);
  }
};
