import { Name } from "src/common/name";
import { ServiceInfo } from "src/common/serviceInfo";

export enum LoadBalancerType {
    RoundRobin,
    WeightedRoundRobin,
    None
}

export interface LoadBalancer {
    balanceService(serviceInfo: Name): Promise<ServiceInfo>;
}

export class LoadBalancerError extends Error {
    constructor(message : string) {
        super(message);
        
        this.name = this.constructor.name;
        this.stack = new Error().stack;
    }
}