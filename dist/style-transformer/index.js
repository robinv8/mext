"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var node_sass_1 = __importDefault(require("node-sass"));
var path_1 = __importDefault(require("path"));
var traverse_1 = __importDefault(require("@babel/traverse"));
var t = __importStar(require("@babel/types"));
var node_sass_package_importer_1 = __importDefault(require("node-sass-package-importer"));
var node_sass_alias_importer_1 = __importDefault(require("node-sass-alias-importer"));
var StyleTransformer = /** @class */ (function () {
    function StyleTransformer(filePath) {
        this.appDir = path_1.default.resolve(process.cwd());
        this.filePath = filePath;
    }
    StyleTransformer.prototype.getScss = function (ast) {
        var cssPath = [];
        (0, traverse_1.default)(ast, {
            Program: {
                enter: function (astPath) {
                    var bodyNode = astPath.get('body');
                    var styleNodes = bodyNode.filter(function (p) {
                        return p.isImportDeclaration() &&
                            p.node.source.value.match(/\.scss/) &&
                            !p.node.source.value.match(/\.module\.scss/);
                    });
                    styleNodes.forEach(function (p) {
                        cssPath.push(p.node.source.value);
                        p.remove();
                    });
                },
            },
        });
        return cssPath;
    };
    StyleTransformer.prototype.getCss = function (paths) {
        var _this = this;
        return Promise.all(paths.map(function (fileName) { return __awaiter(_this, void 0, void 0, function () {
            var name;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (fileName.match(/@(assets|pages)\//)) {
                            name = fileName.replace('@', 'src/');
                        }
                        return [4 /*yield*/, this.sassToCss(name ? this.appDir : this.filePath, name || fileName)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        }); }));
    };
    StyleTransformer.prototype.sassToCss = function (codePath, fileName) {
        return new Promise(function (resolve) {
            node_sass_1.default.render({
                file: path_1.default.join(codePath, fileName),
                importer: [
                    (0, node_sass_package_importer_1.default)(),
                    (0, node_sass_alias_importer_1.default)({
                        '@assets': path_1.default.join(path_1.default.resolve(process.cwd()), 'src/assets/'),
                    }),
                ],
            }, function (err, result) {
                if (err) {
                    console.log(err);
                    resolve('');
                    return;
                }
                resolve(result.css.toString());
            });
        });
    };
    StyleTransformer.prototype.createStyleElement = function (css) {
        css = css.replace(/url\(['"]?(.*?)['"]?\)/g, function (match, url) {
            if (url.match(/^(http|https|data)/)) {
                return match;
            }
            return "url(${require('" + url + "').default.src})";
        });
        return t.jsxElement(t.jsxOpeningElement(t.jsxIdentifier('style'), [
            t.jsxAttribute(t.jsxIdentifier('jsx')),
            t.jsxAttribute(t.jsxIdentifier('global')),
        ], false), t.jsxClosingElement(t.jsxIdentifier('style')), [t.jsxText('{`' + css + '`}')]);
    };
    StyleTransformer.prototype.run = function (ast) {
        return __awaiter(this, void 0, void 0, function () {
            var scssPaths, csses;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        scssPaths = this.getScss(ast);
                        if (scssPaths.length === 0) {
                            return [2 /*return*/, []];
                        }
                        return [4 /*yield*/, this.getCss(scssPaths)];
                    case 1:
                        csses = _a.sent();
                        return [2 /*return*/, csses.map(function (css) { return _this.createStyleElement(css); })];
                }
            });
        });
    };
    return StyleTransformer;
}());
exports.default = StyleTransformer;
//# sourceMappingURL=index.js.map