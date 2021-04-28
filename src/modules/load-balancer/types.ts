import { EventEmitter } from "node:events";
import { ServiceInfo } from "../../common/serviceInfo";

export interface LoadBalancerModule {
    getBalancedServiceUrl(serviceInfo: ServiceInfo): Promise<URL>;
}

export class LoadBalancerModuleError extends Error {
    constructor(message : string) {
        super(message);
        
        this.name = this.constructor.name;
        this.stack = new Error().stack;
    }
}