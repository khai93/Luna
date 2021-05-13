import EventEmitter from "node:events";
import { ServiceModule, ServiceModuleEvents } from "./types";
import TypedEmitter from "typed-emitter";
import InstanceId from "../../common/instanceId";
import { Name } from "../../common/name";
import { ServiceInfo } from "../../common/serviceInfo";

export class MemoryServiceModule extends (EventEmitter as new () => TypedEmitter<ServiceModuleEvents>)  implements ServiceModule {
    constructor() {
        super();
    }
    add(serviceInfo: ServiceInfo): Promise<ServiceInfo> {
        throw new Error("Method not implemented.");
    }
    update(serviceInfo: ServiceInfo): Promise<ServiceInfo> {
        throw new Error("Method not implemented.");
    }
    remove(instanceId: InstanceId): Promise<void> {
        throw new Error("Method not implemented.");
    }
    findByInstanceId(instanceId: InstanceId): Promise<ServiceInfo | null> {
        throw new Error("Method not implemented.");
    }
    findAllByName(serviceName: Name): Promise<ServiceInfo[] | null> {
        throw new Error("Method not implemented.");
    }
    getAll(): Promise<ServiceInfo[]> {
        throw new Error("Method not implemented.");
    }
}