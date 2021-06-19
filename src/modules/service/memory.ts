import { ServiceModule, ServiceModuleEvents } from "./types";
import TypedEmitter from "typed-emitter";
import InstanceId from "../../common/instanceId";
import { Name } from "../../common/name";
import { ServiceInfo } from "../../common/serviceInfo";
import EventEmitter from "events";

export class MemoryServiceModule extends (EventEmitter as new () => TypedEmitter<ServiceModuleEvents>)  implements ServiceModule {
    private _services: ServiceInfo[];
    
    constructor() {
        super();
        this._services = [];
    }
    
    add(serviceInfo: ServiceInfo): Promise<ServiceInfo> {
        return new Promise((resolve, reject) => {
            if (this._services.some(service => service.value.instanceId.equals(serviceInfo.value.instanceId)))
                return reject("Attempted to add service that already exists.");

            this._services.push(serviceInfo);
            this.emit("add", serviceInfo);

            return resolve(serviceInfo);
        });
    }

    update(serviceInfo: ServiceInfo): Promise<ServiceInfo> {
        const foundService = this._services.findIndex(service => service.value.instanceId.equals(serviceInfo.value.instanceId));

        if (foundService == -1) {
            return Promise.reject("Attempted to update service instance that is not registered.");
        }

        this._services[foundService] = serviceInfo;
        this.emit("update", serviceInfo);

        return Promise.resolve(this._services[foundService]);
    }

    remove(instanceId: InstanceId): Promise<void> {
        const foundService = this._services.findIndex(service => service.value.instanceId.equals(instanceId));

        if (foundService == -1) {
            return Promise.reject("Attempted to remove service instance that is not registered.");
        }

        delete this._services[foundService];
        this._services = this._services.filter(service => service != null);
        this.emit("remove", instanceId)

        return Promise.resolve();
    }

    findByInstanceId(instanceId: InstanceId): Promise<ServiceInfo | undefined> {
        const foundService = this._services.find(service => service.value.instanceId.equals(instanceId));

        return Promise.resolve(foundService);
    }
    
    findAllByName(serviceName: Name): Promise<ServiceInfo[]> {
        
        const found = this._services.filter(service => service.value.name.equals(serviceName));
        
        return Promise.resolve(found);
    }

    getAll(): Promise<ServiceInfo[]> {
        return Promise.resolve(this._services);
    }
}