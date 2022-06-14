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
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidModel = void 0;
var utils = __importStar(require("../../utils"));
var t = utils.t, traverse = utils.traverse, parser = utils.parser;
function getIdentifierDeclaration(node, path) {
    if (t.isIdentifier(node) && path.scope.hasBinding(node.name)) {
        var bindingNode = path.scope.getBinding(node.name).path.node;
        if (t.isVariableDeclarator(bindingNode)) {
            bindingNode = bindingNode.init;
        }
        return bindingNode;
    }
    return node;
}
function getTSNode(node) {
    if (
    // <Model> {}
    t.isTSTypeAssertion(node) ||
        // {} as Model
        t.isTSAsExpression(node)) {
        return node.expression;
    }
    else {
        return node;
    }
}
function isValidModel(_a) {
    var content = _a.content;
    var parser = utils.parser;
    var ast = parser.parse(content, {
        sourceType: 'module',
        plugins: [
            'typescript',
            'classProperties',
            'dynamicImport',
            'exportDefaultFrom',
            'exportNamespaceFrom',
            'functionBind',
            'nullishCoalescingOperator',
            'objectRestSpread',
            'optionalChaining',
            'decorators-legacy',
        ],
    });
    var isDvaModel = false;
    var imports = {};
    traverse(ast, {
        ImportDeclaration: function (path) {
            var _a = path.node, specifiers = _a.specifiers, source = _a.source;
            specifiers.forEach(function (specifier) {
                if (t.isImportDefaultSpecifier(specifier)) {
                    imports[specifier.local.name] = source.value;
                }
            });
        },
        ExportDefaultDeclaration: function (path) {
            var node = path.node
                .declaration;
            node = getTSNode(node);
            node = getIdentifierDeclaration(node, path);
            node = getTSNode(node);
            // 支持 dva-model-extend
            if (t.isCallExpression(node) &&
                t.isIdentifier(node.callee) &&
                imports[node.callee.name] === 'dva-model-extend') {
                node = node.arguments[1];
                node = getTSNode(node);
                node = getIdentifierDeclaration(node, path);
                node = getTSNode(node);
            }
            if (t.isObjectExpression(node) &&
                node.properties.some(function (property) {
                    return [
                        'state',
                        'reducers',
                        'subscriptions',
                        'effects',
                        'namespace',
                    ].includes(property.key.name);
                })) {
                isDvaModel = true;
            }
        },
    });
    return isDvaModel;
}
exports.isValidModel = isValidModel;
//# sourceMappingURL=isValidModel.js.map