import express from 'express';
const router = express.Router();
import passport from 'passport';
import { getRepository } from 'typeorm';
import { COOKIE_NAME, __prod__ } from '../constants';
import SocialUser from '../entity/SocialUser';
import { Strategy as GitHubStrategy } from 'passport-github';

passport.serializeUser((user: any, done) => {
  done(null, user.githubId);
});

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: 'http://localhost:4000/auth/github/callback',
    },
    async (_, __, profile, cb) => {
      const users = getRepository(SocialUser);

      let user = await users.findOne({
        where: { githubId: profile.id },
      });

      if (user === undefined) {
        const User = await users.create({
          githubId: profile.id,
        });

        await await users.save(User);

        const u = await users.findOne({
          where: { githubId: profile.id },
        });
        cb(null, u);
      } else {
        // user is in the database, update the info

        const u = await users.findOne({
          where: { githubId: profile.id },
        });
        console.log('userDb', u);
        cb(null, u);
      }
    },
  ),
);

router.get(
  '/auth/github',
  passport.authenticate('github', {
    session: false,
  }),
);

router.get(
  '/auth/github/callback',
  passport.authenticate('github', {
    session: false,
  }),
  async (req: any, res) => {
    res.cookie(COOKIE_NAME, req.user.id, {
      maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
      httpOnly: true,
      sameSite: 'lax', // csrf
      secure: __prod__, // cookie only works in https
    });
    res.json({ user: req.user });
  },
);

router.get('/', async (req, res) => {
  const { qid } = req.cookies;
  const users = getRepository(SocialUser);
  const user = await users.findOne(qid);

  res.json({ user });
});

module.exports = router;
