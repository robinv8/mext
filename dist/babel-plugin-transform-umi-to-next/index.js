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
var parser = __importStar(require("@babel/parser"));
var traverse_1 = __importDefault(require("@babel/traverse"));
var t = __importStar(require("@babel/types"));
var style_transformer_1 = __importDefault(require("../style-transformer"));
var CodeTransform = /** @class */ (function () {
    function CodeTransform(_a) {
        var appDir = _a.appDir, filePath = _a.filePath, code = _a.code;
        this.ast = parser.parse(code, {
            sourceType: 'module',
            plugins: ['jsx', 'typescript']
        });
        this.appDir = appDir;
        this.filePath = filePath;
        this.code = code;
    }
    CodeTransform.prototype.run = function () {
        return __awaiter(this, void 0, void 0, function () {
            var styleTransformer, styleElements;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        styleTransformer = new style_transformer_1.default(this.filePath);
                        return [4 /*yield*/, styleTransformer.run(this.ast)];
                    case 1:
                        styleElements = _a.sent();
                        return [2 /*return*/, this.umiToNext(styleElements)];
                }
            });
        });
    };
    CodeTransform.prototype.hasJsx = function (ast) {
        var isJSX = false;
        (0, traverse_1.default)(ast, {
            JSXElement: function () {
                isJSX = true;
            }
        });
        return isJSX;
    };
    CodeTransform.prototype.umiToNext = function (styleElement) {
        var isJSX = this.hasJsx(this.ast);
        try {
            (0, traverse_1.default)(this.ast, {
                Program: {
                    enter: function (rootPath) {
                        var _a;
                        var bodyNode = rootPath.get('body');
                        if (!isJSX) {
                            return;
                        }
                        var defaultNode = bodyNode.find(function (p) { return p.isExportDefaultDeclaration(); });
                        var defaultName = (_a = defaultNode.node.declaration) === null || _a === void 0 ? void 0 : _a.name;
                        defaultNode.traverse({
                            CallExpression: function (p) {
                                defaultName = p.node.arguments[0].name;
                                if (defaultName) {
                                    p.stop();
                                }
                            }
                        });
                        var filteredNode = bodyNode.filter(function (p) { return !p.isExportDefaultDeclaration() && !p.isImportDeclaration() && !p.isExpressionStatement() && !p.isExportNamedDeclaration(); });
                        var findedNode = filteredNode.find(function (p) { return p.isVariableDeclaration() ? p.node.declarations[0].id.name === defaultName : p.node.id.name === defaultName; });
                        if ((styleElement === null || styleElement === void 0 ? void 0 : styleElement.length) > 0) {
                            var styleCode = "const _styleJSX = (<></>)";
                            var styleAst = parser.parse(styleCode, {
                                sourceType: 'module',
                                plugins: ['jsx', 'typescript']
                            });
                            (0, traverse_1.default)(styleAst, {
                                JSXFragment: function (astPath) {
                                    var _a;
                                    (_a = astPath.node.children).push.apply(_a, styleElement);
                                }
                            });
                            findedNode.insertBefore(styleAst.program.body);
                            findedNode === null || findedNode === void 0 ? void 0 : findedNode.traverse({
                                ReturnStatement: function (astPath) {
                                    var _a, _b;
                                    if (((_a = astPath.node.argument) === null || _a === void 0 ? void 0 : _a.type) === 'JSXElement') {
                                        var objectNode = t.jsxExpressionContainer(t.identifier('_styleJSX'));
                                        astPath.node.argument.children.push(objectNode);
                                    }
                                    if (((_b = astPath.node.argument) === null || _b === void 0 ? void 0 : _b.type) === "JSXFragment") {
                                        var objectNode = t.jsxExpressionContainer(t.identifier('_styleJSX'));
                                        astPath.node.argument.children.push(objectNode);
                                    }
                                },
                            });
                        }
                        var expressionNode = bodyNode.filter(function (p) { return p.isExpressionStatement(); }).find(function (p) { var _a, _b; return ((_b = (_a = p.node.expression.left) === null || _a === void 0 ? void 0 : _a.property) === null || _b === void 0 ? void 0 : _b.name) === 'getInitialProps'; });
                        if (expressionNode) {
                            var functionNode = t.variableDeclaration('const', [t.variableDeclarator(t.identifier('getServerSideProps'), expressionNode.node.expression.right.expression)]);
                            var exportNode = t.exportNamedDeclaration(functionNode);
                            expressionNode.replaceWith(exportNode);
                            expressionNode.stop();
                        }
                    },
                    exit: function (rootPath) {
                        var isCreateHead = false, isCreateImage = false;
                        rootPath.traverse({
                            // ImportSpecifier(astPath) {
                            //   if (astPath.node.imported.name === 'Helmet') {
                            //     astPath.remove()
                            //   }
                            // },
                            JSXElement: function (astPath) {
                                // if (astPath.node.openingElement.name.name === 'Helmet' && astPath.node.closingElement.name.name === 'Helmet') {
                                //   astPath.node.openingElement.name.name = astPath.node.closingElement.name.name = 'Head'
                                //   if (isCreateHead) {
                                //     return
                                //   }
                                //   isCreateHead = true
                                //   const importHead = t.importDeclaration([t.importDefaultSpecifier(t.identifier('Head'))], t.stringLiteral('next/head'))
                                //   rootPath.get('body').find(p => p.isImportDeclaration()).insertAfter(importHead)
                                // }
                                // if (astPath.node.openingElement?.name?.name === 'img' && (!astPath.node.closingElement?.name?.name || astPath.node.closingElement?.name?.name === 'img')) {
                                // }
                                astPath.traverse({
                                    JSXExpressionContainer: function (astPath) {
                                        if (astPath.node.expression.type === 'CallExpression' && astPath.node.expression.callee.name === 'require') {
                                            astPath.node.expression = t.memberExpression(astPath.node.expression, t.identifier('default.src'));
                                        }
                                    }
                                });
                            }
                        });
                    }
                },
            });
        }
        catch (e) {
            console.log('------------', e);
        }
        return this.ast;
    };
    return CodeTransform;
}());
exports.default = CodeTransform;
//# sourceMappingURL=index.js.map