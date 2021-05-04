import { ServiceInfo } from "../../common/serviceInfo";

export enum LoadBalancerType {
    RoundRobin,
    WeightedRoundRobin,
    Default
}

export type LoadBalancerTypeListItem = {
    type: LoadBalancerType,
    module: any
}


export interface LoadBalancerModule {
    balanceService(serviceInfo: ServiceInfo): Promise<URL | string | void>;
}

export class LoadBalancerModuleError extends Error {
    constructor(message : string) {
        super(message);
        
        this.name = this.constructor.name;
        this.stack = new Error().stack;
    }
}