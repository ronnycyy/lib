"use strict";
/* eslint-disable ava/use-test */
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
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const anyproxy_1 = __importStar(require("anyproxy"));
const ava_1 = require("ava");
const axios_1 = __importDefault(require("axios"));
const get_port_1 = __importDefault(require("get-port"));
const got_1 = __importDefault(require("got"));
const request_1 = __importDefault(require("request"));
const sinon_1 = __importDefault(require("sinon"));
const createGlobalProxyAgent_1 = __importDefault(require("../../../src/factories/createGlobalProxyAgent"));
const anyproxyDefaultRules = {
    beforeDealHttpsRequest: async () => {
        return true;
    },
    beforeSendRequest: () => {
        return {
            response: {
                body: 'OK',
                header: {
                    'content-type': 'text/plain',
                },
                statusCode: 200,
            },
        };
    },
};
const defaultHttpAgent = http_1.default.globalAgent;
const defaultHttpsAgent = https_1.default.globalAgent;
let lastPort = 3000;
let localProxyServers = [];
let localHttpServers = [];
const getNextPort = () => {
    return (0, get_port_1.default)({
        port: get_port_1.default.makeRange(lastPort++, 3500),
    });
};
(0, ava_1.before)(() => {
    if (anyproxy_1.default.utils.certMgr.ifRootCAFileExists()) {
        return;
    }
    // @see https://github.com/alibaba/anyproxy/issues/332#issuecomment-486705002
    anyproxy_1.default.utils.certMgr.generateRootCA((error) => {
        if (error) {
            // eslint-disable-next-line no-console
            console.error('cannot generate certificate', error);
        }
    });
});
(0, ava_1.beforeEach)(() => {
    http_1.default.globalAgent = defaultHttpAgent;
    https_1.default.globalAgent = defaultHttpsAgent;
});
(0, ava_1.afterEach)(() => {
    for (const localProxyServer of localProxyServers) {
        localProxyServer.stop();
    }
    localProxyServers = [];
    for (const localHttpServer of localHttpServers) {
        localHttpServer.stop();
    }
    localHttpServers = [];
});
const createHttpResponseResolver = (resolve) => {
    return (response) => {
        let body = '';
        response.on('data', (data) => {
            body += data;
        });
        response.on('end', () => {
            if (!response.headers) {
                throw new Error('response.headers is not defined');
            }
            if (!response.statusCode) {
                throw new Error('response.statusCode is not defined');
            }
            resolve({
                body,
                headers: response.headers,
                statusCode: response.statusCode,
            });
        });
    };
};
const createProxyServer = async (anyproxyRules) => {
    const port = await getNextPort();
    const localProxyServer = await new Promise((resolve) => {
        const proxyServer = new anyproxy_1.ProxyServer({
            port,
            rule: {
                ...anyproxyRules ? anyproxyRules : anyproxyDefaultRules,
            },
        });
        proxyServer.on('ready', () => {
            resolve({
                port,
                stop: () => {
                    proxyServer.close();
                },
                url: 'http://127.0.0.1:' + port,
            });
        });
        proxyServer.start();
    });
    localProxyServers.push(localProxyServer);
    return localProxyServer;
};
const createHttpServer = async () => {
    const port = await getNextPort();
    const localHttpServer = await new Promise((resolve) => {
        const httpServer = http_1.default.createServer((request, response) => {
            response.end('DIRECT');
        });
        httpServer.listen(port, () => {
            resolve({
                stop: () => {
                    httpServer.close();
                },
                url: 'http://127.0.0.1:' + port,
            });
        });
    });
    localHttpServers.push(localHttpServer);
    return localHttpServer;
};
(0, ava_1.serial)('proxies HTTP request', async (t) => {
    const globalProxyAgent = (0, createGlobalProxyAgent_1.default)();
    const proxyServer = await createProxyServer();
    globalProxyAgent.HTTP_PROXY = proxyServer.url;
    const response = await new Promise((resolve) => {
        http_1.default.get('http://127.0.0.1', createHttpResponseResolver(resolve));
    });
    t.is(response.body, 'OK');
});
(0, ava_1.serial)('proxies HTTP request with proxy-authorization header', async (t) => {
    const globalProxyAgent = (0, createGlobalProxyAgent_1.default)();
    const beforeSendRequest = sinon_1.default.stub().callsFake(anyproxyDefaultRules.beforeSendRequest);
    const proxyServer = await createProxyServer({
        beforeSendRequest,
    });
    globalProxyAgent.HTTP_PROXY = 'http://foo@127.0.0.1:' + proxyServer.port;
    const response = await new Promise((resolve) => {
        http_1.default.get('http://127.0.0.1', createHttpResponseResolver(resolve));
    });
    t.is(response.body, 'OK');
    t.is(beforeSendRequest.firstCall.args[0].requestOptions.headers['proxy-authorization'], 'Basic Zm9v');
});
(0, ava_1.serial)('proxies HTTPS request', async (t) => {
    const globalProxyAgent = (0, createGlobalProxyAgent_1.default)();
    const proxyServer = await createProxyServer();
    globalProxyAgent.HTTP_PROXY = proxyServer.url;
    const response = await new Promise((resolve) => {
        https_1.default.get('https://127.0.0.1', {}, createHttpResponseResolver(resolve));
    });
    t.is(response.body, 'OK');
});
(0, ava_1.serial)('proxies HTTPS request with proxy-authorization header', async (t) => {
    const globalProxyAgent = (0, createGlobalProxyAgent_1.default)();
    const beforeDealHttpsRequest = sinon_1.default.stub().callsFake(async () => {
        return true;
    });
    const proxyServer = await createProxyServer({
        beforeDealHttpsRequest,
        beforeSendRequest: anyproxyDefaultRules.beforeSendRequest,
    });
    globalProxyAgent.HTTP_PROXY = 'http://foo@127.0.0.1:' + proxyServer.port;
    const response = await new Promise((resolve) => {
        https_1.default.get('https://127.0.0.1', {}, createHttpResponseResolver(resolve));
    });
    t.is(response.body, 'OK');
    t.is(beforeDealHttpsRequest.firstCall.args[0]._req.headers['proxy-authorization'], 'Basic Zm9v');
});
(0, ava_1.serial)('does not produce unhandled rejection when cannot connect to proxy', async (t) => {
    const globalProxyAgent = (0, createGlobalProxyAgent_1.default)();
    const port = await getNextPort();
    globalProxyAgent.HTTP_PROXY = 'http://127.0.0.1:' + port;
    await t.throwsAsync((0, got_1.default)('http://127.0.0.1'));
});
(0, ava_1.serial)('proxies HTTPS request with dedicated proxy', async (t) => {
    const globalProxyAgent = (0, createGlobalProxyAgent_1.default)();
    const proxyServer = await createProxyServer();
    globalProxyAgent.HTTPS_PROXY = proxyServer.url;
    const response = await new Promise((resolve) => {
        https_1.default.get('https://127.0.0.1', {}, createHttpResponseResolver(resolve));
    });
    t.is(response.body, 'OK');
});
(0, ava_1.serial)('ignores dedicated HTTPS proxy for HTTP urls', async (t) => {
    const globalProxyAgent = (0, createGlobalProxyAgent_1.default)();
    const proxyServer = await createProxyServer();
    globalProxyAgent.HTTP_PROXY = proxyServer.url;
    globalProxyAgent.HTTPS_PROXY = 'http://example.org';
    const response = await new Promise((resolve) => {
        http_1.default.get('http://127.0.0.1', {}, createHttpResponseResolver(resolve));
    });
    t.is(response.body, 'OK');
});
(0, ava_1.serial)('forwards requests matching NO_PROXY', async (t) => {
    const globalProxyAgent = (0, createGlobalProxyAgent_1.default)();
    const proxyServer = await createProxyServer();
    const httpServer = await createHttpServer();
    globalProxyAgent.HTTP_PROXY = proxyServer.url;
    globalProxyAgent.NO_PROXY = '127.0.0.1';
    const response = await new Promise((resolve) => {
        http_1.default.get(httpServer.url, createHttpResponseResolver(resolve));
    });
    t.is(response.body, 'DIRECT');
});
(0, ava_1.serial)('proxies HTTP request (using http.get(host))', async (t) => {
    const globalProxyAgent = (0, createGlobalProxyAgent_1.default)();
    const proxyServer = await createProxyServer();
    globalProxyAgent.HTTP_PROXY = proxyServer.url;
    const response = await new Promise((resolve) => {
        http_1.default.get({
            host: '127.0.0.1',
        }, createHttpResponseResolver(resolve));
    });
    t.is(response.body, 'OK');
});
(0, ava_1.serial)('proxies HTTP request (using got)', async (t) => {
    const globalProxyAgent = (0, createGlobalProxyAgent_1.default)();
    const proxyServer = await createProxyServer();
    globalProxyAgent.HTTP_PROXY = proxyServer.url;
    const response = await (0, got_1.default)('http://127.0.0.1');
    t.is(response.body, 'OK');
});
(0, ava_1.serial)('proxies HTTPS request (using got)', async (t) => {
    const globalProxyAgent = (0, createGlobalProxyAgent_1.default)();
    const proxyServer = await createProxyServer();
    globalProxyAgent.HTTP_PROXY = proxyServer.url;
    const response = await (0, got_1.default)('https://127.0.0.1');
    t.is(response.body, 'OK');
});
(0, ava_1.serial)('proxies HTTP request (using axios)', async (t) => {
    const globalProxyAgent = (0, createGlobalProxyAgent_1.default)();
    const proxyServer = await createProxyServer();
    globalProxyAgent.HTTP_PROXY = proxyServer.url;
    const response = await axios_1.default.get('http://127.0.0.1');
    t.is(response.data, 'OK');
});
(0, ava_1.serial)('proxies HTTPS request (using axios)', async (t) => {
    const globalProxyAgent = (0, createGlobalProxyAgent_1.default)();
    const proxyServer = await createProxyServer();
    globalProxyAgent.HTTP_PROXY = proxyServer.url;
    const response = await axios_1.default.get('https://127.0.0.1');
    t.is(response.data, 'OK');
});
(0, ava_1.serial)('proxies HTTP request (using request)', async (t) => {
    const globalProxyAgent = (0, createGlobalProxyAgent_1.default)();
    const proxyServer = await createProxyServer();
    globalProxyAgent.HTTP_PROXY = proxyServer.url;
    const response = await new Promise((resolve) => {
        (0, request_1.default)('http://127.0.0.1', (error, requestResponse, body) => {
            t.is(error, null);
            resolve(body);
        });
    });
    t.is(response, 'OK');
});
(0, ava_1.serial)('proxies HTTPS request (using request)', async (t) => {
    const globalProxyAgent = (0, createGlobalProxyAgent_1.default)();
    const proxyServer = await createProxyServer();
    globalProxyAgent.HTTP_PROXY = proxyServer.url;
    const response = await new Promise((resolve) => {
        (0, request_1.default)('https://127.0.0.1', (error, requestResponse, body) => {
            t.is(error, null);
            resolve(body);
        });
    });
    t.is(response, 'OK');
});
