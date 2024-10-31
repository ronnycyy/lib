"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const serialize_error_1 = require("serialize-error");
const Logger_1 = __importDefault(require("../Logger"));
const log = Logger_1.default.child({
    namespace: 'Agent',
});
let requestId = 0;
class Agent {
    constructor(isProxyConfigured, mustUrlUseProxy, getUrlProxy, fallbackAgent, socketConnectionTimeout) {
        this.fallbackAgent = fallbackAgent;
        this.isProxyConfigured = isProxyConfigured;
        this.mustUrlUseProxy = mustUrlUseProxy;
        this.getUrlProxy = getUrlProxy;
        this.socketConnectionTimeout = socketConnectionTimeout;
    }
    addRequest(request, configuration) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        let requestUrl;
        // It is possible that addRequest was constructed for a proxied request already, e.g.
        // "request" package does this when it detects that a proxy should be used
        // https://github.com/request/request/blob/212570b6971a732b8dd9f3c73354bcdda158a737/request.js#L402
        // https://gist.github.com/gajus/e2074cd3b747864ffeaabbd530d30218
        if ((_a = request.path.startsWith('http://')) !== null && _a !== void 0 ? _a : request.path.startsWith('https://')) {
            requestUrl = request.path;
        }
        else {
            requestUrl = this.protocol + '//' + ((_b = configuration.hostname) !== null && _b !== void 0 ? _b : configuration.host) + (((_c = configuration.port === 80) !== null && _c !== void 0 ? _c : configuration.port === 443) ? '' : ':' + configuration.port) + request.path;
        }
        if (!this.isProxyConfigured()) {
            log.trace({
                destination: requestUrl,
            }, 'not proxying request; GLOBAL_AGENT.HTTP_PROXY is not configured');
            // @ts-expect-error seems like we are using wrong type for fallbackAgent.
            this.fallbackAgent.addRequest(request, configuration);
            return;
        }
        if (!this.mustUrlUseProxy(requestUrl)) {
            log.trace({
                destination: requestUrl,
            }, 'not proxying request; url matches GLOBAL_AGENT.NO_PROXY');
            // @ts-expect-error seems like we are using wrong type for fallbackAgent.
            this.fallbackAgent.addRequest(request, configuration);
            return;
        }
        const currentRequestId = requestId++;
        const proxy = this.getUrlProxy(requestUrl);
        if (this.protocol === 'http:') {
            request.path = requestUrl;
            if (proxy.authorization) {
                request.setHeader('proxy-authorization', 'Basic ' + Buffer.from(proxy.authorization).toString('base64'));
            }
        }
        log.trace({
            destination: requestUrl,
            proxy: 'http://' + proxy.hostname + ':' + proxy.port,
            requestId: currentRequestId,
        }, 'proxying request');
        request.on('error', (error) => {
            log.error({
                error: (0, serialize_error_1.serializeError)(error),
            }, 'request error');
        });
        request.once('response', (response) => {
            log.trace({
                headers: response.headers,
                requestId: currentRequestId,
                statusCode: response.statusCode,
            }, 'proxying response');
        });
        request.shouldKeepAlive = false;
        const connectionConfiguration = {
            host: (_e = (_d = configuration.hostname) !== null && _d !== void 0 ? _d : configuration.host) !== null && _e !== void 0 ? _e : '',
            port: (_f = configuration.port) !== null && _f !== void 0 ? _f : 80,
            proxy,
            tls: {},
        };
        // add optional tls options for https requests.
        // @see https://nodejs.org/docs/latest-v12.x/api/https.html#https_https_request_url_options_callback :
        // > The following additional options from tls.connect()
        // >   - https://nodejs.org/docs/latest-v12.x/api/tls.html#tls_tls_connect_options_callback -
        // > are also accepted:
        // >   ca, cert, ciphers, clientCertEngine, crl, dhparam, ecdhCurve, honorCipherOrder,
        // >   key, passphrase, pfx, rejectUnauthorized, secureOptions, secureProtocol, servername, sessionIdContext.
        if (configuration.secureEndpoint) {
            connectionConfiguration.tls = {
                ca: configuration.ca,
                cert: configuration.cert,
                ciphers: configuration.ciphers,
                clientCertEngine: configuration.clientCertEngine,
                crl: configuration.crl,
                dhparam: configuration.dhparam,
                ecdhCurve: configuration.ecdhCurve,
                honorCipherOrder: configuration.honorCipherOrder,
                key: configuration.key,
                passphrase: configuration.passphrase,
                pfx: configuration.pfx,
                rejectUnauthorized: (_g = configuration.rejectUnauthorized) !== null && _g !== void 0 ? _g : true,
                secureOptions: configuration.secureOptions,
                secureProtocol: configuration.secureProtocol,
                servername: (_h = configuration.servername) !== null && _h !== void 0 ? _h : connectionConfiguration.host,
                sessionIdContext: configuration.sessionIdContext,
            };
            // This is not ideal because there is no way to override this setting using `tls` configuration if `NODE_TLS_REJECT_UNAUTHORIZED=0`.
            // However, popular HTTP clients (such as https://github.com/sindresorhus/got) come with pre-configured value for `rejectUnauthorized`,
            // which makes it impossible to override that value globally and respect `rejectUnauthorized` for specific requests only.
            if (
            // eslint-disable-next-line node/no-process-env
            process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0') {
                // @ts-expect-error seems like we are using wrong guard for this change that does not align with secureEndpoint
                connectionConfiguration.tls.rejectUnauthorized = false;
            }
        }
        this.createConnection(connectionConfiguration, (error, socket) => {
            log.trace({
                target: connectionConfiguration,
            }, 'connecting');
            // @see https://github.com/nodejs/node/issues/5757#issuecomment-305969057
            if (socket) {
                socket.setTimeout(this.socketConnectionTimeout, () => {
                    socket.destroy();
                });
                socket.once('connect', () => {
                    log.trace({
                        target: connectionConfiguration,
                    }, 'connected');
                    socket.setTimeout(0);
                });
                socket.once('secureConnect', () => {
                    log.trace({
                        target: connectionConfiguration,
                    }, 'connected (secure)');
                    socket.setTimeout(0);
                });
            }
            if (error) {
                request.emit('error', error);
            }
            else if (socket) {
                log.debug('created socket');
                socket.on('error', (socketError) => {
                    log.error({
                        error: (0, serialize_error_1.serializeError)(socketError),
                    }, 'socket error');
                });
                request.onSocket(socket);
            }
        });
    }
}
exports.default = Agent;
