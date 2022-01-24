"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const apollo_server_express_1 = require("apollo-server-express");
const schema_ts_1 = __importDefault(require("./graphql/schema.ts"));
const auth_1 = __importDefault(require("./routes/auth"));
const routes_1 = __importDefault(require("./routes"));
const apollo_server_core_1 = require("apollo-server-core");
const ValidateTokensMiddleware_1 = require("./middlewares/ValidateTokensMiddleware");
const createLoader_1 = __importDefault(require("./loaders/createLoader"));
const app = (0, express_1.default)();
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ limit: '50mb', extended: true }));
app.use('/', auth_1.default);
app.use(ValidateTokensMiddleware_1.ValidateTokensMiddleware);
app.get('/', (_req, res) => res.send('hello'));
app.use('/api/v2/auth', routes_1.default);
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        const server = new apollo_server_express_1.ApolloServer({
            schema: schema_ts_1.default,
            context: ({ req, res }) => ({
                req,
                res,
                loaders: (0, createLoader_1.default)(),
            }),
            introspection: true,
            plugins: [
                process.env.NODE_ENV === 'production'
                    ? (0, apollo_server_core_1.ApolloServerPluginLandingPageDisabled)()
                    : (0, apollo_server_core_1.ApolloServerPluginLandingPageGraphQLPlayground)(),
            ],
        });
        yield server.start();
        const prod = process.env.NODE_ENV === 'production'
            ? 'http://www.woongblog.xzy'
            : 'http://localhost:3000';
        server.applyMiddleware({
            app,
            cors: {
                origin: 'http://localhost:3000',
                credentials: true,
            },
        });
    });
}
startServer();
exports.default = app;
