import EventEmitter from 'node:events';
import { ServiceInfo } from '../../common/serviceInfo';
import { Name } from '../../common/name';
import TypedEmitter from "typed-emitter"
import { ServiceModule, ServiceModuleRemoveError, ServiceModuleUpdateError, ServiceModuleEvents, ServiceModuleAddError } from './types';
import InstanceId from '../../common/instanceId';

export class MemoryServiceModule extends (EventEmitter as new () => TypedEmitter<ServiceModuleEvents>) implements ServiceModule {
    private _services: ServiceInfo[];
    private _nonNullServices = (): ServiceInfo[]  => this._services.filter(service => service !== null);

    constructor() {
        super();
        this._services = [];
    }

    add(serviceInfo: ServiceInfo): Promise<ServiceInfo> {
        return new Promise((resolve, reject) => {
            let serviceIndex = this._nonNullServices().findIndex(service => serviceInfo && service.equals(serviceInfo));

            if (serviceIndex === -1) {
                this._services.push(serviceInfo);
                
                serviceIndex = this._nonNullServices().findIndex(service => serviceInfo && service.equals(serviceInfo));
                
                this.emit("add", serviceInfo);
                return resolve(this._services[serviceIndex]);
            } else {
                const error = new ServiceModuleAddError("Attempted to add already existing service '" + serviceInfo.value.name.value + "'");
                
                this.emit("error", error);
                return reject(error);
            }
        });
    }

    update(serviceInfo: ServiceInfo): Promise<ServiceInfo> {
        return new Promise((resolve, reject) => {
            let serviceIndex = this._nonNullServices().findIndex(service => serviceInfo != null && service.equals(serviceInfo));

            if (serviceIndex === -1) {
                const error = new ServiceModuleUpdateError("Attempted to update a service that does not exist");

                this.emit("error", error);
                return reject(error);
            }

            if (serviceInfo) {
                this._services[serviceIndex] = serviceInfo;

                this.emit("update", serviceInfo);
                return resolve(serviceInfo);
            } else {
                const error = new ServiceModuleUpdateError("serviceInfo unexpectedly not truthy");

                this.emit("error", error);
                return reject(error);
            }
        })
    }

    remove(instanceId: InstanceId): Promise<void> {
        return new Promise((resolve, reject) => {
            const serviceIndex = this._nonNullServices().findIndex(service => service.value.instanceId.equals(instanceId));

            if (serviceIndex !== null) {
                delete this._services[serviceIndex];

                this.emit("remove", instanceId)
                return resolve();
            } else {
                const error = new ServiceModuleRemoveError("InstanceId does not exist in database");
                
                this.emit('error', error);
                return reject(error);
            }
        });
    }

    findByInstanceId(instanceId: InstanceId): Promise<ServiceInfo | null> {
        return new Promise((resolve, reject) => {
            const foundIndex = this._nonNullServices().findIndex(service => service.value.instanceId.equals(instanceId));

            if (foundIndex === -1) {
                return resolve(null);
            }

            return resolve(this._services[foundIndex]);
        });
    }

    findByName(serviceName: Name) : Promise<ServiceInfo[] | null> {
        return new Promise((resolve, reject) => {
            const foundServices = this._nonNullServices().filter(service => service.value.name.equals(serviceName));

            if (foundServices.length <= 0) {
                return resolve(null);
            }

            return resolve(foundServices);
        });
    }

    get services() { return this._services }
}