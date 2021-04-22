import EventEmitter from "node:events";
import { Name } from "../../../common/name";
import { ServiceInfo } from "../../../common/serviceInfo";

export interface ServiceModule extends EventEmitter {
    readonly services: ServiceInfo[];
    update(serviceInfo: ServiceInfo): Promise<ServiceInfo>;
    remove(serviceName: Name): Promise<void>;
}

export interface ServiceModuleEvents {
    error: (error: Error) => void,
    update: (updatedServiceInfo: ServiceInfo, updatedServiceInfoIndex: number) => void,
    remove: (removedServiceName: Name) => void
}

export class ServiceModuleUpdateError extends Error {
    constructor(message : string) {
        super(message);
        
        this.name = this.constructor.name;
        this.stack = new Error().stack;
    }
}

export class ServiceModuleRemoveError extends Error {
    constructor(message : string) {
        super(message);
        
        this.name = this.constructor.name;
        this.stack = new Error().stack;
    }
}