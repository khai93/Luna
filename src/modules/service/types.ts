import EventEmitter from "node:events";
import { Name } from "../../common/name";
import { ServiceInfo } from "../../common/serviceInfo";

export interface ServiceModule extends EventEmitter {
    readonly services: ServiceInfo[];
    add(serviceInfo: ServiceInfo): Promise<ServiceInfo>;
    update(serviceInfo: ServiceInfo): Promise<ServiceInfo>;
    remove(serviceName: Name): Promise<void>;
    find(serviceName: Name): Promise<ServiceInfo | null>;
}

export interface ServiceModuleEvents {
    error: (error: Error) => void,
    update: (updatedServiceInfo: ServiceInfo) => void,
    remove: (removedServiceName: Name) => void,
    add: (addedServiceInfo: ServiceInfo) => void
}

export class ServiceModuleAddError extends Error {
    constructor(message : string) {
        super(message);
        
        this.name = this.constructor.name;
        this.stack = new Error().stack;
    }
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