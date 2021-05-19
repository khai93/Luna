import EventEmitter from "node:events";
import InstanceId from "../../common/instanceId";
import { Name } from "../../common/name";
import { ServiceInfo } from "../../common/serviceInfo";

export interface ServiceModule extends EventEmitter {
    /**
     * Add a service to the database
     * @param serviceInfo Service to be added
     * @returns {Promise<ServiceInfo | null>} added service info or null if it couldn't add the service
     */
    add(serviceInfo: ServiceInfo): Promise<ServiceInfo>;

    /**
     * Updates a service based on its instanceId in the object.
     * InstanceId's cannot change between services.
     * @param serviceInfo Service to update
     * @returns updated serviceInfo
     */
    update(serviceInfo: ServiceInfo): Promise<ServiceInfo>;
    remove(instanceId: InstanceId): Promise<void>;
    findByInstanceId(instanceId: InstanceId): Promise<ServiceInfo | undefined>;
    findAllByName(serviceName: Name): Promise<ServiceInfo[]>;
    getAll(): Promise<ServiceInfo[]>;
}

export interface ServiceModuleEvents {
    error: (error: Error) => void,
    update: (updatedServiceInfo: ServiceInfo) => void,
    remove: (removedServiceName: InstanceId) => void,
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