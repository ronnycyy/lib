"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const parseProxyUrl_1 = __importDefault(require("../../../src/utilities/parseProxyUrl"));
(0, ava_1.default)('extracts hostname', (t) => {
    t.is((0, parseProxyUrl_1.default)('http://0.0.0.0').hostname, '0.0.0.0');
});
(0, ava_1.default)('extracts port', (t) => {
    t.is((0, parseProxyUrl_1.default)('http://0.0.0.0:3000').port, 3000);
});
(0, ava_1.default)('extracts authorization', (t) => {
    t.is((0, parseProxyUrl_1.default)('http://foo:bar@0.0.0.0').authorization, 'foo:bar');
});
(0, ava_1.default)('throws an error if protocol is not "http:"', (t) => {
    const error = t.throws(() => {
        (0, parseProxyUrl_1.default)('https://0.0.0.0:3000');
    });
    t.is(error.message, 'Unsupported `GLOBAL_AGENT.HTTP_PROXY` configuration value: URL protocol must be "http:".');
});
(0, ava_1.default)('throws an error if query is present', (t) => {
    const error = t.throws(() => {
        (0, parseProxyUrl_1.default)('http://0.0.0.0:3000/?foo=bar');
    });
    t.is(error.message, 'Unsupported `GLOBAL_AGENT.HTTP_PROXY` configuration value: URL must not have query.');
});
(0, ava_1.default)('throws an error if hash is present', (t) => {
    const error = t.throws(() => {
        (0, parseProxyUrl_1.default)('http://0.0.0.0:3000/#foo');
    });
    t.is(error.message, 'Unsupported `GLOBAL_AGENT.HTTP_PROXY` configuration value: URL must not have hash.');
});
