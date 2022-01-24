"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkEmpty = exports.escape = void 0;
const escape = (text) => {
    return text
        .replace(/[^0-9a-zA-Zㄱ-힣.\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf -]/g, '')
        .trim()
        .replace(/ /g, '-')
        .replace(/--+/g, '-')
        .replace(/\.+$/, '');
};
exports.escape = escape;
function checkEmpty(text) {
    if (!text)
        return true;
    const replaced = text
        .trim()
        .replace(/([\u3164\u115F\u1160\uFFA0\u200B\u0001-\u0008\u000B-\u000C\u000E-\u001F]+)/g, '')
        .replace(/&nbsp;/, '');
    if (replaced === '')
        return true;
    return false;
}
exports.checkEmpty = checkEmpty;
