"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalize = void 0;
function normalize(array, selector = (item) => item.id) {
    const object = {};
    array.forEach((item) => {
        object[selector(item)] = item;
    });
    return object;
}
exports.normalize = normalize;
