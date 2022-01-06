import 'dotenv/config';
import 'reflect-metadata';
import express from 'express';
import cookieParser from 'cookie-parser';
import { ApolloServer } from 'apollo-server-express';
import schema from './graphql/schema.ts';
import session from 'express-session';
import auth from './routes/auth';
import {
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageDisabled,
} from 'apollo-server-core';
import { ValidateTokensMiddleware } from './middlewares/ValidateTokensMiddleware';
import passport from 'passport';

import { __prod__, COOKIE_NAME, COOKIE_SECRET } from './constants';
import cookieEncrypter from 'cookie-encrypter';

const app = express();

app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/', auth);

app.use(ValidateTokensMiddleware);

app.get('/', (_req, res) => res.send('hello'));
app.use('/', require('./routes/github'));
app.use(
  session({
    name: COOKIE_NAME,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      secure: __prod__, // cookie only works in https
    },
    saveUninitialized: false,
    secret: COOKIE_SECRET,
    resave: false,
  }),
);

app.use(passport.initialize());
app.use(passport.session());

async function startServer() {
  const server = new ApolloServer({
    schema,
    context: ({ req, res }) => ({
      req,
      res,
    }),
    introspection: true,

    plugins: [
      process.env.NODE_ENV === 'production'
        ? ApolloServerPluginLandingPageDisabled()
        : ApolloServerPluginLandingPageGraphQLPlayground(),
    ],
  });

  await server.start();

  server.applyMiddleware({
    app,
    cors: {
      origin: 'http://localhost:3000',
      credentials: true,
    },
  });
}

startServer();

export default app;
