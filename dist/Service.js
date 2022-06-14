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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path = __importStar(require("path"));
var fs = __importStar(require("fs-extra"));
var parser = __importStar(require("@babel/parser"));
var traverse_1 = __importDefault(require("@babel/traverse"));
var generator_1 = __importDefault(require("@babel/generator"));
var t = __importStar(require("@babel/types"));
var babel_plugin_transform_umi_to_next_1 = __importDefault(require("./babel-plugin-transform-umi-to-next"));
var router_transformer_1 = __importDefault(require("./router-transformer"));
var plugin_dva_1 = __importDefault(require("./plugin-dva"));
var Service = /** @class */ (function () {
    function Service() {
        this.appDir = path.resolve(process.cwd());
        this.config = this.loadConfig();
        this.tsConfig = this.loadTsConfig();
    }
    Service.prototype.loadConfig = function () {
        var configPath = path.join(this.appDir, '.mextrc.ts');
        var config = require(configPath);
        return config;
    };
    Service.prototype.loadTsConfig = function () {
        var tsConfigPath = path.join(this.appDir, 'tsconfig.json');
        var tsConfig = require(tsConfigPath);
        return tsConfig;
    };
    Service.prototype.run = function () {
        return __awaiter(this, void 0, void 0, function () {
            var nextConfigPath, tsConfigPath;
            var _this = this;
            return __generator(this, function (_a) {
                this.copyTask();
                nextConfigPath = path.join(this.appDir, '.mext', 'next.tsconfig.json');
                tsConfigPath = path.join(this.appDir, '.mext', 'tsconfig.json');
                fs.renameSync(nextConfigPath, tsConfigPath);
                this.config.transform.forEach(function (type) {
                    _this.transformTask(type);
                });
                this.routerTransformTask();
                (0, plugin_dva_1.default)();
                this.generateHeader();
                return [2 /*return*/];
            });
        });
    };
    Service.prototype.umiToNext = function (filePath, fileName, type) {
        return __awaiter(this, void 0, void 0, function () {
            var appDir, code, transform, ast, result, newFilePath, newFileName;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        appDir = this.appDir;
                        code = this.getCode(filePath, fileName);
                        transform = new babel_plugin_transform_umi_to_next_1.default({
                            appDir: appDir,
                            filePath: filePath,
                            code: code,
                        });
                        return [4 /*yield*/, transform.run()];
                    case 1:
                        ast = _a.sent();
                        result = (0, generator_1.default)(ast, {
                            retainLines: true,
                        });
                        newFilePath = filePath.replace("/src/".concat(type), "/.mext/".concat(type));
                        if (!fs.existsSync(newFilePath)) {
                            fs.mkdirSync(newFilePath, { recursive: true });
                        }
                        newFileName = fileName;
                        if (newFilePath.toLowerCase().indexOf('component') === -1) {
                            newFileName = fileName.replace('.tsx', '.page.tsx');
                        }
                        fs.writeFileSync(path.join(newFilePath, newFileName), result.code);
                        return [2 /*return*/];
                }
            });
        });
    };
    Service.prototype.copyFile = function (filePath, filename, type) {
        var newFilePath = filePath.replace("/src/".concat(type), "/.mext/".concat(type));
        if (!fs.existsSync(newFilePath)) {
            fs.mkdirSync(newFilePath, { recursive: true });
        }
        fs.writeFileSync(path.join(newFilePath, filename), fs.readFileSync(path.join(filePath, filename)));
    };
    Service.prototype.fileDisplay = function (filePath, type) {
        var _this = this;
        // 显示目录下的所有文件名
        var files = fs.readdirSync(filePath);
        files.forEach(function (filename) {
            if (fs.statSync(path.join(filePath, filename)).isDirectory()) {
                _this.fileDisplay(path.join(filePath, filename), type);
            }
            else {
                if (filename.match('.tsx') && filename.indexOf('_app.page.tsx') === -1 && filePath.indexOf('__test__') === -1) {
                    _this.umiToNext(filePath, filename, type);
                }
                else if (filename.match('.scss')) {
                    if (filename.match('.module.scss')) {
                        _this.copyFile(filePath, filename, type);
                    }
                }
                else {
                    _this.copyFile(filePath, filename, type);
                }
            }
        });
    };
    Service.prototype.getCode = function (filePath, fileName) {
        return fs.readFileSync(path.join(filePath, fileName)).toString();
    };
    Service.prototype.transformTask = function (type) {
        var pagesPath = path.join(this.appDir, "src/".concat(type));
        this.fileDisplay(pagesPath, type);
    };
    Service.prototype.routerTransformTask = function () {
        return __awaiter(this, void 0, void 0, function () {
            var routerPath, nextConfigPath, routes, routerTransformer, nextRoutes, nextConfigFile, ast, result;
            return __generator(this, function (_a) {
                routerPath = path.join(this.appDir, 'routes.json');
                nextConfigPath = path.join(this.appDir, '.mext/next.config.js');
                routes = require(routerPath);
                routerTransformer = new router_transformer_1.default(routes);
                nextRoutes = routerTransformer.transform();
                nextConfigFile = fs.readFileSync(nextConfigPath);
                ast = parser.parse(nextConfigFile.toString());
                (0, traverse_1.default)(ast, {
                    ObjectExpression: function (astPath) {
                        if (astPath.parent.type !== 'AssignmentExpression') {
                            return;
                        }
                        var rewrites = nextRoutes.map(function (route) {
                            return t.objectExpression([
                                t.objectProperty(t.identifier('source'), t.stringLiteral(route.source)),
                                t.objectProperty(t.identifier('destination'), t.stringLiteral(route.destination)),
                            ]);
                        });
                        var newRoutes = t.arrayExpression(rewrites);
                        var arrowFunction = t.arrowFunctionExpression([], newRoutes);
                        arrowFunction.async = true;
                        var filtered = astPath.node.properties.filter(function (property) { return property.key.name === 'rewrites'; });
                        if (filtered.length > 0) {
                            filtered[0].value = arrowFunction;
                        }
                        else {
                            astPath.node.properties.push(t.objectProperty(t.identifier('rewrites'), arrowFunction));
                        }
                    },
                });
                result = (0, generator_1.default)(ast);
                fs.writeFileSync(nextConfigPath, result.code);
                return [2 /*return*/];
            });
        });
    };
    Service.prototype.copyTask = function () {
        var appDir = this.appDir;
        this.config.copy.directories.forEach(function (type) {
            var filePath = path.join(appDir, "src/".concat(type));
            var distPath = path.join(appDir, ".mext/".concat(type));
            fs.copySync(filePath, distPath);
        });
        var filePath = path.join(appDir, 'public');
        if (fs.existsSync(filePath)) {
            var distPath = path.join(appDir, ".mext/public");
            fs.copySync(filePath, distPath);
        }
        this.config.copy.files.forEach(function (filename) {
            var filePath = path.join(appDir, filename);
            if (!fs.existsSync(filePath)) {
                filePath = path.join(appDir, 'src', filename);
            }
            var distPath = path.join(appDir, ".mext/".concat(filename));
            fs.copySync(filePath, distPath);
        });
    };
    Service.prototype.generateHeader = function () {
        var _a, _b, _c, _d, _e, _f;
        var code = fs.readFileSync(path.join(this.appDir, '.mext/layouts/index.tsx'));
        var ast = parser.parse(code.toString(), {
            sourceType: 'module',
            plugins: ['jsx', 'typescript']
        });
        var metaAst = (_b = (_a = this.config) === null || _a === void 0 ? void 0 : _a.metas) === null || _b === void 0 ? void 0 : _b.map(function (meta) {
            var keys = Object.keys(meta);
            return t.jsxElement(t.jsxOpeningElement(t.jsxIdentifier('meta'), keys.map(function (key) {
                return t.jsxAttribute(t.jsxIdentifier(key), t.stringLiteral(meta[key]));
            })), t.jsxClosingElement(t.jsxIdentifier('meta')), []);
        });
        var linkAst = (_d = (_c = this.config) === null || _c === void 0 ? void 0 : _c.links) === null || _d === void 0 ? void 0 : _d.map(function (link) {
            var keys = Object.keys(link);
            return t.jsxElement(t.jsxOpeningElement(t.jsxIdentifier('link'), keys.map(function (key) {
                return t.jsxAttribute(t.jsxIdentifier(key), t.stringLiteral(link[key]));
            })), t.jsxClosingElement(t.jsxIdentifier('link')), []);
        });
        var scriptAst = (_f = (_e = this.config) === null || _e === void 0 ? void 0 : _e.scripts) === null || _f === void 0 ? void 0 : _f.map(function (script) {
            var keys = Object.keys(script);
            return t.jsxElement(t.jsxOpeningElement(t.jsxIdentifier('script'), keys.map(function (key) {
                return t.jsxAttribute(t.jsxIdentifier(key), t.stringLiteral(script[key]));
            })), t.jsxClosingElement(t.jsxIdentifier('script')), []);
        });
        (0, traverse_1.default)(ast, {
            JSXElement: function (astPath) {
                if (astPath.node.openingElement.name.name === 'Helmet') {
                    astPath.node.children = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], astPath.node.children, true), metaAst, true), linkAst, true), scriptAst, true);
                }
            }
        });
        var result = (0, generator_1.default)(ast);
        fs.writeFileSync(path.join(this.appDir, '.mext/layouts/index.tsx'), result.code);
    };
    return Service;
}());
exports.default = Service;
//# sourceMappingURL=Service.js.map