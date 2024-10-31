"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const createProxyController_1 = __importDefault(require("../../../src/factories/createProxyController"));
(0, ava_1.default)('sets HTTP_PROXY', (t) => {
    const globalAgentGlobal = (0, createProxyController_1.default)();
    globalAgentGlobal.HTTP_PROXY = 'http://127.0.0.1';
    t.is(globalAgentGlobal.HTTP_PROXY, 'http://127.0.0.1');
});
(0, ava_1.default)('sets HTTPS_PROXY', (t) => {
    const globalAgentGlobal = (0, createProxyController_1.default)();
    globalAgentGlobal.HTTPS_PROXY = 'http://127.0.0.1';
    t.is(globalAgentGlobal.HTTPS_PROXY, 'http://127.0.0.1');
});
(0, ava_1.default)('sets NO_PROXY', (t) => {
    const globalAgentGlobal = (0, createProxyController_1.default)();
    globalAgentGlobal.NO_PROXY = '*';
    t.is(globalAgentGlobal.NO_PROXY, '*');
});
(0, ava_1.default)('throws an error if unknown property is set', (t) => {
    const globalAgentGlobal = (0, createProxyController_1.default)();
    const error = t.throws(() => {
        // @ts-expect-error expected unknown property.
        globalAgentGlobal.FOO = 'BAR';
    });
    t.is(error.message, 'Cannot set an unmapped property "FOO".');
});
