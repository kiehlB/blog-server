import { Request, Response } from 'express';
import { verify } from 'jsonwebtoken';
import User from '../entity/User';
import { getRepository } from 'typeorm';
import { decodeToken, setTokenCookie } from '../lib/token';

export const refresh = async (res, refreshToken: string) => {
  try {
    const decoded = await decodeToken(refreshToken);
    const user = await getRepository(User).findOne(decoded.user_id);
    if (!user) {
      const error = new Error('InvalidUserError');
      throw error;
    }
    const tokens = await user.refreshUserToken(
      decoded.token_id,
      decoded.exp,
      refreshToken,
    );
    setTokenCookie(res, tokens);
    return decoded.user_id;
  } catch (e) {
    throw e;
  }
};

export const ValidateTokensMiddleware = async (req: any, res: Response, next: any) => {
  const accessToken = req.cookies['access_token'];
  const refreshToken = req.cookies['refresh_token'];

  let data;

  try {
    data = verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as any;

    res.locals.user_id = data.user.userId;
    const diff = data.exp * 1000 - new Date().getTime();
    if (diff < 1000 * 60 * 30 && refreshToken) {
      await refresh(res, refreshToken);
    }
  } catch (e) {
    if (!refreshToken) return next();
    try {
      const userId = await refresh(res, refreshToken);

      // set user_id if succeeds
      res.locals.user_id = userId;
    } catch (e) {}
  }

  return next();
};
