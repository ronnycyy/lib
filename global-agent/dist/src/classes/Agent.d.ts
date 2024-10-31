/// <reference types="node" />
/// <reference types="node" />
import type * as http from 'http';
import type * as https from 'https';
import type { AgentType, ConnectionCallbackType, ConnectionConfigurationType, GetUrlProxyMethodType, IsProxyConfiguredMethodType, MustUrlUseProxyMethodType, ProtocolType } from '../types';
type AgentRequestOptions = {
    host?: string;
    path?: string;
    port: number;
};
type HttpRequestOptions = AgentRequestOptions & Omit<http.RequestOptions, keyof AgentRequestOptions> & {
    secureEndpoint: false;
};
type HttpsRequestOptions = AgentRequestOptions & Omit<https.RequestOptions, keyof AgentRequestOptions> & {
    secureEndpoint: true;
};
type RequestOptions = HttpRequestOptions | HttpsRequestOptions;
declare abstract class Agent {
    defaultPort: number;
    protocol: ProtocolType;
    fallbackAgent: AgentType;
    isProxyConfigured: IsProxyConfiguredMethodType;
    mustUrlUseProxy: MustUrlUseProxyMethodType;
    getUrlProxy: GetUrlProxyMethodType;
    socketConnectionTimeout: number;
    constructor(isProxyConfigured: IsProxyConfiguredMethodType, mustUrlUseProxy: MustUrlUseProxyMethodType, getUrlProxy: GetUrlProxyMethodType, fallbackAgent: AgentType, socketConnectionTimeout: number);
    abstract createConnection(configuration: ConnectionConfigurationType, callback: ConnectionCallbackType): void;
    addRequest(request: http.ClientRequest, configuration: RequestOptions): void;
}
export default Agent;
