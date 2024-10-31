import type { AgentType, ConnectionCallbackType, ConnectionConfigurationType, GetUrlProxyMethodType, IsProxyConfiguredMethodType, MustUrlUseProxyMethodType } from '../types';
import Agent from './Agent';
declare class HttpProxyAgent extends Agent {
    constructor(isProxyConfigured: IsProxyConfiguredMethodType, mustUrlUseProxy: MustUrlUseProxyMethodType, getUrlProxy: GetUrlProxyMethodType, fallbackAgent: AgentType, socketConnectionTimeout: number);
    createConnection(configuration: ConnectionConfigurationType, callback: ConnectionCallbackType): void;
}
export default HttpProxyAgent;
