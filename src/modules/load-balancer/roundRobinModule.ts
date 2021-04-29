import { inject, injectable } from "tsyringe";
import InstanceId from "../../common/instanceId";
import { Name } from "../../common/name";
import { ServiceInfo } from "../../common/serviceInfo";
import { LoggerModule } from "../logger/types";
import { ServiceModule } from "../service/types";
import { LoadBalancerModule, LoadBalancerModuleError } from "./types";

export type RoundRobinServiceData = {
    serviceName: Name,
    currentIndex: number
}

@injectable()
export class RoundRobinModule implements LoadBalancerModule {
    private _servicesData: RoundRobinServiceData[];

    constructor(
        @inject("ServiceModule") private serviceModule: ServiceModule,
        @inject("LoggerModule") private logger: LoggerModule
    ) {
        this._servicesData = [];
        this.logger.info("Load Balancer loaded with Round Robin method.");
    }

    getBalancedServiceUrl(serviceInfo: ServiceInfo): Promise<URL> {
        return new Promise(async (resolve, reject) => {
            const serviceInstances = await this.serviceModule.findAllByName(serviceInfo.value.name);

            if (serviceInstances == null || serviceInstances && serviceInstances.length <= 0) {
                return new LoadBalancerModuleError("Service does not have any instances registered.");
            }

            /**
             * Service only has one instance for it, no balancing required.
             * Return the only instance.
             */
            if (serviceInstances.length === 1) {
                this.logger.log("RoundRobinModule: Only one instance in list");
                return resolve(serviceInstances[0].value.url);
            }

            const serviceDataIndex = this._servicesData.findIndex(service => service.serviceName.equals(serviceInfo.value.name));
            
            if (serviceDataIndex < 0) {
                this._servicesData.push({
                    serviceName: serviceInfo.value.name,
                    currentIndex: 0
                });

                return resolve(serviceInstances[0].value.url);
            }

            if (this._servicesData[serviceDataIndex].currentIndex + 1 >= serviceInstances.length) {
                this._servicesData[serviceDataIndex].currentIndex = 0;
            } else {
                this._servicesData[serviceDataIndex].currentIndex++;
            }

            
            return resolve(serviceInstances[this._servicesData[serviceDataIndex].currentIndex].value.url);
        });
    }
}

