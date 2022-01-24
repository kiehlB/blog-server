"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./env");
const server_1 = __importDefault(require("./server"));
const database_1 = __importDefault(require("./database"));
const { PORT } = process.env;
const database = new database_1.default();
database.getConnection().then(() => {
    server_1.default.listen(PORT, () => {
        var _a;
        console.log('hello server');
        (_a = process.send) === null || _a === void 0 ? void 0 : _a.call(process, 'ready');
    });
});
