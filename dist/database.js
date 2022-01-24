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
const typeorm_1 = require("typeorm");
const entity_1 = __importDefault(require("./entity"));
require("pg");
class Database {
    constructor() {
        this.connectionManager = (0, typeorm_1.getConnectionManager)();
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            const password = process.env.TYPEORM_PASSWORD;
            if (!password) {
                throw new Error('Failed to load database password');
            }
            const connectionOptions = {
                entities: entity_1.default,
                password,
                // dropSchema: true,
                type: process.env.TYPEORM_CONNECTION,
                host: process.env.TYPEORM_HOST,
                database: process.env.TYPEORM_DATABASE,
                username: process.env.TYPEORM_USERNAME,
                port: parseInt(process.env.TYPEORM_PORT || '5432', 10),
                synchronize: true,
                appname: 'woong-blog',
                logging: false,
            };
            return (0, typeorm_1.createConnection)(connectionOptions);
        });
    }
    getConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            const CONNECTION_NAME = `default`;
            if (this.connectionManager.has(CONNECTION_NAME)) {
                const connection = this.connectionManager.get(CONNECTION_NAME);
                try {
                    if (connection.isConnected) {
                        yield connection.close();
                    }
                }
                catch (_a) { }
                return connection.connect();
            }
            return this.connect();
        });
    }
}
exports.default = Database;
