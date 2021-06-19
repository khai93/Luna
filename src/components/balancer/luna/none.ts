import { Name } from "src/common/name";
import { ServiceInfo } from "src/common/serviceInfo";
import { TOKENS } from "src/di";
import { LoggerModule } from "src/modules/logger/types";
import { ServiceModule } from "src/modules/service/types";
import { autoInjectable, inject } from "tsyringe";
import { LoadBalancer, LoadBalancerError } from "../types";


@autoInjectable()
export class LunaNoneBalancer implements LoadBalancer {
    constructor(
        @inject(TOKENS.modules.logger) private logger?: LoggerModule,
        @inject(TOKENS.modules.service) private serviceModule?: ServiceModule
    ) {
        this.logger?.log("Load Balancer loaded with None method.");
    }

    balanceService(serviceName: Name): Promise<ServiceInfo> {
        return new Promise(async (resolve, reject) => {
            const serviceInstances = await this.serviceModule?.findAllByName(serviceName);

            if (serviceInstances == null || serviceInstances && serviceInstances.length <= 0) {
                return new LoadBalancerError("Service does not have any instances registered.");
            }

            return resolve(serviceInstances[0]);
        })
    }
}