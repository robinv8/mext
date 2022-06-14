#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var minimist_1 = __importDefault(require("minimist"));
var chalk_1 = __importDefault(require("chalk"));
var clear_1 = __importDefault(require("clear"));
var figlet_1 = __importDefault(require("figlet"));
var Service_1 = __importDefault(require("./Service"));
var CLI = /** @class */ (function () {
    function CLI() {
    }
    CLI.prototype.run = function () {
        (0, clear_1.default)();
        console.log(chalk_1.default.red(figlet_1.default.textSync('mext-cli', { horizontalLayout: 'full' })));
        this.parseArgs();
    };
    CLI.prototype.parseArgs = function () {
        var args = (0, minimist_1.default)(process.argv.slice(2));
        var _ = args._;
        var command = _[0];
        switch (command) {
            case 'generate':
                var service = new Service_1.default();
                service.run();
                break;
        }
    };
    return CLI;
}());
exports.default = CLI;
//# sourceMappingURL=index.js.map