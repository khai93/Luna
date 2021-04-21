import { ServiceInfo } from '../../common/serviceInfo/';



export interface IServiceModule {
    readonly services: ServiceInfo[];
    update(serviceInfo: ServiceInfo): Promise<ServiceInfo>;
    remove(serviceName: string): Promise<void>;
}

export class MemoryServiceModule implements IServiceModule {
    private _services: ServiceInfo[];

    constructor() {
        this._services = [];
    }

    update(serviceInfo: ServiceInfo): Promise<ServiceInfo> {
        return new Promise((resolve, reject) => {
            const serviceIndex = this._services.findIndex(service => serviceInfo && service.sameAs(serviceInfo));

            if (serviceInfo) {
                this._services[serviceIndex] = serviceInfo;
                return resolve(serviceInfo);
            } else {
                return reject("MemoryServiceModule->update: serviceInfo not truthy");
            }
        })
    }

    remove(serviceName: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const serviceIndex = this._services.findIndex(service => service.value.name == serviceName);

            if (serviceIndex) {
                delete this._services[serviceIndex];
                return resolve();
            } else {
                return reject("MemoryServiceModule->remove: serviceName does not exist in database");
            }
        });
    }

    get services() { return this._services }
}