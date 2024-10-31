"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const net_1 = __importDefault(require("net"));
const tls_1 = __importDefault(require("tls"));
const Agent_1 = __importDefault(require("./Agent"));
class HttpsProxyAgent extends Agent_1.default {
    constructor(isProxyConfigured, mustUrlUseProxy, getUrlProxy, fallbackAgent, socketConnectionTimeout) {
        super(isProxyConfigured, mustUrlUseProxy, getUrlProxy, fallbackAgent, socketConnectionTimeout);
        this.protocol = 'https:';
        this.defaultPort = 443;
    }
    createConnection(configuration, callback) {
        const socket = net_1.default.connect(configuration.proxy.port, configuration.proxy.hostname);
        socket.on('error', (error) => {
            callback(error);
        });
        socket.once('data', () => {
            const secureSocket = tls_1.default.connect({
                ...configuration.tls,
                socket,
            });
            callback(null, secureSocket);
        });
        let connectMessage = '';
        connectMessage += 'CONNECT ' + configuration.host + ':' + configuration.port + ' HTTP/1.1\r\n';
        connectMessage += 'Host: ' + configuration.host + ':' + configuration.port + '\r\n';
        if (configuration.proxy.authorization) {
            connectMessage += 'Proxy-Authorization: Basic ' + Buffer.from(configuration.proxy.authorization).toString('base64') + '\r\n';
        }
        connectMessage += '\r\n';
        socket.write(connectMessage);
    }
}
exports.default = HttpsProxyAgent;
