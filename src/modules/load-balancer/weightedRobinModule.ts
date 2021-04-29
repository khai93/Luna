import { inject, injectable } from "tsyringe";
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
export class WeightedRoundRobinModule implements LoadBalancerModule {

    constructor(
        @inject("ServiceModule") private serviceModule: ServiceModule,
        @inject("LoggerModule") private logger: LoggerModule
    ) {
        this.logger.info("Load Balancer loaded with Weighted Round Robin method.");
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
                return resolve(serviceInstances[0].value.url);
            }
        });
    }
}