"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
var path_1 = require("path");
var fs_1 = require("fs");
var getModels_1 = require("./getModels/getModels");
var _utils_1 = require("../utils");
exports.default = (function () {
    function getModelDir() {
        return 'models';
    }
    function getAllModels() {
        var srcPath = (0, path_1.join)(process.cwd(), '.mext');
        return _utils_1.lodash.uniq(__spreadArray(__spreadArray([], (0, getModels_1.getModels)({
            base: srcPath,
            cwd: '',
            pattern: "**/".concat(getModelDir(), "/**/*.{ts,tsx,js,jsx}"),
        }), true), (0, getModels_1.getModels)({
            base: srcPath,
            cwd: '',
            pattern: "**/model.{ts,tsx,js,jsx}",
        }), true));
    }
    function onGenerateFiles() {
        var models = getAllModels();
        var hasModels = models.length > 0;
        if (!hasModels)
            return;
        var dvaTpl = (0, fs_1.readFileSync)((0, path_1.join)(__dirname, 'dva.tpl'), 'utf-8');
        var dvaContent = _utils_1.Mustache.render(dvaTpl, {
            RegisterModelImports: models
                .map(function (path, index) {
                var modelName = "Model".concat(_utils_1.lodash.upperFirst(_utils_1.lodash.camelCase((0, path_1.basename)(path, (0, path_1.extname)(path))))).concat(index);
                return "import ".concat(modelName, " from '").concat(path, "';");
            })
                .join('\r\n'),
            RegisterModels: models
                .map(function (path, index) {
                return "\napp.model({ namespace: '".concat((0, path_1.basename)(path, (0, path_1.extname)(path)), "', ...Model").concat(_utils_1.lodash.upperFirst(_utils_1.lodash.camelCase((0, path_1.basename)(path, (0, path_1.extname)(path))))).concat(index, " });\n          ").trim();
            })
                .join('\r\n')
        });
        (0, fs_1.writeFileSync)((0, path_1.join)(process.cwd(), '.mext/utils/dva.ts'), dvaContent, 'utf-8');
    }
    onGenerateFiles();
});
//# sourceMappingURL=index.js.map