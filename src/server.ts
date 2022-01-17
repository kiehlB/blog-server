import 'dotenv/config';
import 'reflect-metadata';
import express from 'express';
import cookieParser from 'cookie-parser';
import { ApolloServer } from 'apollo-server-express';
import schema from './graphql/schema.ts';
import session from 'express-session';
import auth from './routes/auth';
import social from './routes';
import {
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageDisabled,
} from 'apollo-server-core';
import { ValidateTokensMiddleware } from './middlewares/ValidateTokensMiddleware';
import { __prod__, COOKIE_NAME, COOKIE_SECRET } from './constants';
import createLoaders from './loaders/createLoader';

const app = express();

app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/', auth);

app.use(ValidateTokensMiddleware);

app.get('/', (_req, res) => res.send('hello'));
app.use('/api/v2/auth', social);

async function startServer() {
  const server = new ApolloServer({
    schema,
    context: ({ req, res }) => ({
      req,
      res,
      loaders: createLoaders(),
    }),
    introspection: true,

    plugins: [
      process.env.NODE_ENV === 'production'
        ? ApolloServerPluginLandingPageDisabled()
        : ApolloServerPluginLandingPageGraphQLPlayground(),
    ],
  });

  await server.start();

  const prod =
    process.env.NODE_ENV === 'production'
      ? 'http://www.woongblog.ga'
      : 'http://localhost:3000';
  server.applyMiddleware({
    app,
    cors: {
      origin: prod,
      credentials: true,
    },
  });
}

startServer();

export default app;
