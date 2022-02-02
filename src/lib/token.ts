import jwt, { sign, verify } from 'jsonwebtoken';
import User from '../entity/User';
import { Response } from 'express';

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

export const createRefreshToken = (user: User) => {
  return sign(
    {
      user: { userId: user.id, tokenVersion: user.tokenVersion },
    },
    process.env.REFRESH_TOKEN_SECRET!,
    {
      expiresIn: '3d',
    },
  );
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
    httpOnly: true,
    secure: false,
    domain: '.woongblog.xyz',
    maxAge: 1000 * 60 * 60,
  });

  res.cookie('refresh_token', tokens.refreshToken, {
    httpOnly: true,
    secure: false,
    domain: '.woongblog.xyz',
    maxAge: 1000 * 60 * 60,
  });

  // Following codes are for webpack-dev-server proxy
  res.cookie('access_token', tokens.accessToken, {
    httpOnly: true,
    secure: false,
    domain: '.woongblog.xyz',
    maxAge: 1000 * 60 * 60,
  });

  res.cookie('refresh_token', tokens.refreshToken, {
    httpOnly: true,
    secure: false,
    domain: '.woongblog.xyz',
    maxAge: 1000 * 60 * 60,
  });
}

export const createTokens = (user: User) => {
  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);
  return { accessToken, refreshToken };
};

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
