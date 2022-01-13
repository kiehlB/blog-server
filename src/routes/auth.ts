import express from 'express';
import { verify } from 'jsonwebtoken';

import User from '../entity/User';
import { getRepository } from 'typeorm';
import { generateToken, createRefreshToken, sendRefreshToken } from '../lib/token';
const router = express.Router();

router.post('/refresh_token', async (req, res) => {
  const token = req.cookies.jid;
  if (!token) {
    return res.send({ ok: false, accessToken: '' });
  }

  let payload: any = null;
  try {
    payload = verify(token, process.env.REFRESH_TOKEN_SECRET!);
  } catch (err) {
    console.log(err);
    return res.send({ ok: false, accessToken: '' });
  }
  const findUser = getRepository(User);
  const user = await findUser.findOne({ id: payload.userId });

  if (!user) {
    return res.send({ ok: false, accessToken: '' });
  }

  if (user.tokenVersion !== payload.tokenVersion) {
    return res.send({ ok: false, accessToken: '' });
  }

  sendRefreshToken(res, createRefreshToken(user));

  return res.send({ ok: true, accessToken: generateToken(user) });
});

export default router;
