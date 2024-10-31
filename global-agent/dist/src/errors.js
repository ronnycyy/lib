"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnexpectedStateError = void 0;
const es6_error_1 = __importDefault(require("es6-error"));
class UnexpectedStateError extends es6_error_1.default {
    constructor(message, code = 'UNEXPECTED_STATE_ERROR') {
        super(message);
        this.code = code;
    }
}
exports.UnexpectedStateError = UnexpectedStateError;
