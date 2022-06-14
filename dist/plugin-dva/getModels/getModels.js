"use strict";
// @ts-nocheck
Object.defineProperty(exports, "__esModule", { value: true });
exports.getModels = void 0;
var fs_1 = require("fs");
var path_1 = require("path");
var isValidModel_1 = require("./isValidModel");
var _utils_1 = require("../../utils");
function getModels(opts) {
    return _utils_1.lodash
        .uniq(_utils_1.glob
        .sync(opts.pattern || '**/*.{ts,tsx,js,jsx}', {
        cwd: opts.base,
    })
        .map(function (f) { return (0, path_1.join)(opts.base, f); })
        .concat(opts.extraModels || [])
        .map(_utils_1.winPath))
        .filter(function (f) {
        if (/\.d.ts$/.test(f))
            return false;
        if (/\.(test|e2e|spec).(j|t)sx?$/.test(f))
            return false;
        // 允许通过配置下跳过 Model 校验
        if (opts.skipModelValidate)
            return true;
        // TODO: fs cache for performance
        try {
            return (0, isValidModel_1.isValidModel)({
                content: (0, fs_1.readFileSync)(f, 'utf-8'),
            });
        }
        catch (error) {
            throw new Error("Dva model ".concat((0, _utils_1.winPath)((0, path_1.relative)(opts.cwd, f)), " parse failed, ").concat(error));
        }
    });
}
exports.getModels = getModels;
//# sourceMappingURL=getModels.js.map