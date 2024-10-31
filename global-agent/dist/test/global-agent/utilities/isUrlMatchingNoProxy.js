"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const isUrlMatchingNoProxy_1 = __importDefault(require("../../../src/utilities/isUrlMatchingNoProxy"));
(0, ava_1.default)('returns `true` if hosts match', (t) => {
    t.assert((0, isUrlMatchingNoProxy_1.default)('http://foo.com/', 'foo.com'));
});
(0, ava_1.default)('returns `true` if hosts match (IP)', (t) => {
    t.assert((0, isUrlMatchingNoProxy_1.default)('http://127.0.0.1/', '127.0.0.1'));
});
(0, ava_1.default)('returns `true` if hosts match (using asterisk wildcard)', (t) => {
    t.assert((0, isUrlMatchingNoProxy_1.default)('http://bar.foo.com/', '*.foo.com'));
});
(0, ava_1.default)('returns `true` if domain matches (using dot wildcard)', (t) => {
    t.assert((0, isUrlMatchingNoProxy_1.default)('http://foo.com/', '.foo.com'));
});
(0, ava_1.default)('returns `true` if subdomain matches (using dot wildcard)', (t) => {
    t.assert((0, isUrlMatchingNoProxy_1.default)('http://bar.foo.com/', '.foo.com'));
});
(0, ava_1.default)('returns `true` if hosts match (*) and ports match', (t) => {
    t.assert((0, isUrlMatchingNoProxy_1.default)('http://foo.com:8080/', '*:8080'));
});
(0, ava_1.default)('returns `true` if hosts and ports match', (t) => {
    t.assert((0, isUrlMatchingNoProxy_1.default)('http://foo.com:8080/', 'foo.com:8080'));
});
(0, ava_1.default)('returns `true` if hosts match and NO_PROXY does not define port', (t) => {
    t.assert((0, isUrlMatchingNoProxy_1.default)('http://foo.com:8080/', 'foo.com'));
});
(0, ava_1.default)('returns `true` if hosts (IP) and ports match', (t) => {
    t.assert((0, isUrlMatchingNoProxy_1.default)('http://127.0.0.1:8080/', '127.0.0.1:8080'));
});
(0, ava_1.default)('returns `false` if hosts match and ports do not match (diffferent port)', (t) => {
    t.assert((0, isUrlMatchingNoProxy_1.default)('http://foo.com:8080/', 'foo.com:8000') === false);
});
(0, ava_1.default)('returns `false` if hosts match and ports do not match (port not present subject)', (t) => {
    t.assert((0, isUrlMatchingNoProxy_1.default)('http://foo.com/', 'foo.com:8000') === false);
});
(0, ava_1.default)('returns `true` if hosts match and ports do not match (port not present NO_PROXY)', (t) => {
    t.assert((0, isUrlMatchingNoProxy_1.default)('http://foo.com:8000/', 'foo.com'));
});
(0, ava_1.default)('returns `true` if hosts match in one of multiple rules separated with a comma', (t) => {
    t.assert((0, isUrlMatchingNoProxy_1.default)('http://foo.com/', 'bar.org,foo.com,baz.io'));
});
(0, ava_1.default)('returns `true` if hosts match in one of multiple rules separated with a comma and a space', (t) => {
    t.assert((0, isUrlMatchingNoProxy_1.default)('http://foo.com/', 'bar.org, foo.com, baz.io'));
});
(0, ava_1.default)('returns `true` if hosts match in one of multiple rules separated with a space', (t) => {
    t.assert((0, isUrlMatchingNoProxy_1.default)('http://foo.com/', 'bar.org foo.com baz.io'));
});
