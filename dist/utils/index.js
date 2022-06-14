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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mustache = exports.winPath = exports.t = exports.traverse = exports.parser = exports.lodash = exports.glob = void 0;
var glob_1 = require("glob");
Object.defineProperty(exports, "glob", { enumerable: true, get: function () { return __importDefault(glob_1).default; } });
var lodash_1 = require("lodash");
Object.defineProperty(exports, "lodash", { enumerable: true, get: function () { return __importDefault(lodash_1).default; } });
exports.parser = __importStar(require("@babel/parser"));
var traverse_1 = require("@babel/traverse");
Object.defineProperty(exports, "traverse", { enumerable: true, get: function () { return __importDefault(traverse_1).default; } });
exports.t = __importStar(require("@babel/types"));
var winPath_1 = require("./winPath");
Object.defineProperty(exports, "winPath", { enumerable: true, get: function () { return __importDefault(winPath_1).default; } });
var mustache_1 = require("mustache");
Object.defineProperty(exports, "Mustache", { enumerable: true, get: function () { return __importDefault(mustache_1).default; } });
//# sourceMappingURL=index.js.map