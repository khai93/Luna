import EventEmitter from 'node:events';
import { ServiceInfo } from '../../../common/serviceInfo';
import { Name } from '../../../common/name';
import TypedEmitter from "typed-emitter"
import { ServiceModule, ServiceModuleRemoveError, ServiceModuleUpdateError, ServiceModuleEvents } from './types';

export class MemoryServiceModule extends (EventEmitter as new () => TypedEmitter<ServiceModuleEvents>) implements ServiceModule {
    private _services: ServiceInfo[];

    constructor() {
        super();
        this._services = [];
    }

    update(serviceInfo: ServiceInfo): Promise<ServiceInfo> {
        return new Promise((resolve, reject) => {
            const serviceIndex = this._services.findIndex(service => serviceInfo && service.sameAs(serviceInfo));

            if (serviceInfo) {
                this._services[serviceIndex] = serviceInfo;
                
                this.emit("update", serviceInfo, serviceIndex);
                return resolve(serviceInfo);
            } else {
                const error = new ServiceModuleUpdateError("serviceInfo unexpectedly not truthy");

                this.emit("error", error);
                return reject(error);
            }
        })
    }

    remove(serviceName: Name): Promise<void> {
        return new Promise((resolve, reject) => {
            const serviceIndex = this._services.findIndex(service => service.value.name.value == serviceName.value);

            if (serviceIndex) {
                delete this._services[serviceIndex];

                this.emit("remove", serviceName)
                return resolve();
            } else {
                const error = new ServiceModuleRemoveError("serviceName does not exist in database");
                
                this.emit('error', error);
                return reject(error);
            }
        });
    }

    get services() { return this._services }
}