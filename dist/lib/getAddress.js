"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserIpAddress = void 0;
const getUserIpAddress = (request) => {
    const headers = request.headers;
    if (!headers)
        return null;
    const ipAddress = headers['x-forwarded-for'];
    if (!ipAddress)
        return null;
    return ipAddress;
};
exports.getUserIpAddress = getUserIpAddress;
