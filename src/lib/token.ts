import jwt, { sign, verify } from 'jsonwebtoken';
import User from '../entity/User';
import { Response } from 'express';
import AuthToken from '../entity/AuthToken';
import { getRepository } from 'typeorm';

export const generateToken = async (user: any, options?): Promise<string> => {
  const jwtOptions = {
    expiresIn: '7d',
    ...options,
  };

  const secretKey = process.env.REFRESH_TOKEN_SECRET!;

  if (!jwtOptions.expiresIn) {
    // removes expiresIn when expiresIn is given as undefined
    delete jwtOptions.expiresIn;
  }
  return new Promise((resolve, reject) => {
    if (!secretKey) return;
    jwt.sign(user, secretKey, jwtOptions, (err, token) => {
      if (err) reject(err);
      resolve(token);
    });
  });
};

export const createAccessToken = (user: User) => {
  return sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: '15min',
  });
};

export const validateAccessToken = (token: string) => {
  try {
    return verify(token, process.env.ACCESS_TOKEN_SECRET!);
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const validateRefreshToken = (token: string) => {
  try {
    return verify(token, process.env.REFRESH_TOKEN_SECRET!);
  } catch (e) {
    console.log(e);
    return null;
  }
};
export function setTokenCookie(
  res,
  tokens: { accessToken: string; refreshToken: string },
) {
  // set cookie
  res.cookie('access_token', tokens.accessToken, {
    httpOnly: process.env.NODE_ENV === 'production' ? true : false,
    secure: false,
    domain: process.env.NODE_ENV === 'production' ? '.woongblog.xyz' : '',
    maxAge: 1000 * 60 * 60,
  });

  res.cookie('refresh_token', tokens.refreshToken, {
    httpOnly: process.env.NODE_ENV === 'production' ? true : false,
    secure: false,
    domain: process.env.NODE_ENV === 'production' ? '.woongblog.xyz' : '',
    maxAge: 1000 * 60 * 60,
  });

  // Following codes are for webpack-dev-server proxy
  res.cookie('access_token', tokens.accessToken, {
    httpOnly: process.env.NODE_ENV === 'production' ? true : false,
    secure: false,
    domain: process.env.NODE_ENV === 'production' ? '.woongblog.xyz' : '',
    maxAge: 1000 * 60 * 60,
  });

  res.cookie('refresh_token', tokens.refreshToken, {
    httpOnly: process.env.NODE_ENV === 'production' ? true : false,
    secure: false,
    domain: process.env.NODE_ENV === 'production' ? '.woongblog.xyz' : '',
    maxAge: 1000 * 60 * 60,
  });
}

export const sendRefreshToken = (res: Response, token: string) => {
  res.cookie('refresh_token', token, {
    httpOnly: true,
    secure: false,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  });
};

export const decodeToken = async <T = any>(token: string): Promise<T> => {
  const secretKey = process.env.REFRESH_TOKEN_SECRET!;

  return new Promise((resolve, reject) => {
    if (!secretKey) return;
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) reject(err);
      resolve(decoded as any);
    });
  });
};

const generateUserToken = async () => {
  const authToken = new AuthToken();
  const authUser = new User();
  authToken.user_id = authUser.id;
  await getRepository(AuthToken).save(authToken);

  const refreshToken = await generateToken(
    {
      user_id: authUser.id,
      token_id: authToken.id,
    },
    {
      subject: 'refresh_token',
      expiresIn: '30d',
    },
  );

  const accessToken = await generateToken(
    {
      user_id: authUser.id,
    },
    {
      subject: 'access_token',
      expiresIn: '1h',
    },
  );

  return {
    refreshToken,
    accessToken,
  };
};

const refreshUserToken = async (
  tokenId: string,
  refreshTokenExp: number,
  originalRefreshToken: string,
) => {
  const authUser = new User();
  const now = new Date().getTime();
  const diff = refreshTokenExp * 1000 - now;
  let refreshToken = originalRefreshToken;

  if (diff < 1000 * 60 * 60 * 24 * 15) {
    refreshToken = await generateToken(
      {
        user_id: authUser.id,
        token_id: tokenId,
      },
      {
        subject: 'refresh_token',
        expiresIn: '30d',
      },
    );
  }
  const accessToken = await generateToken(
    {
      user_id: authUser.id,
    },
    {
      subject: 'access_token',
      expiresIn: '1h',
    },
  );

  return { refreshToken, accessToken };
};
