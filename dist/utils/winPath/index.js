"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(path) {
    var isExtendedLengthPath = /^\\\\\?\\/.test(path);
    if (isExtendedLengthPath) {
        return path;
    }
    return path.replace(/\\/g, '/');
}
exports.default = default_1;
//# sourceMappingURL=index.js.map