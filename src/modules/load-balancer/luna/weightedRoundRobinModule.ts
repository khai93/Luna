import { inject, injectable } from "tsyringe";
import { Name } from "../../../common/name";
import { ServiceInfo } from "../../../common/serviceInfo";
import { LoggerModule } from "../../logger/types";
import { ServiceModule } from "../../service/types";
import { LoadBalancerModule, LoadBalancerModuleError } from "../types";

@injectable()
export class WeightedRoundRobinModule implements LoadBalancerModule {
    constructor(
        @inject("ServiceModule") private serviceModule: ServiceModule,
        @inject("LoggerModule") private logger: LoggerModule
    ) {
        this.logger.info("Load Balancer loaded with Weighted Round Robin method.");
    }

    balanceService(serviceInfo: ServiceInfo): Promise<URL> {
        return new Promise(async (resolve, reject) => {
            const serviceInstances = await this.serviceModule.findAllByName(serviceInfo.value.name);

            if (serviceInstances == null || serviceInstances && serviceInstances.length <= 0) {
                return new LoadBalancerModuleError("Service does not have any instances registered.");
            }

            const totalInstanceWeight = this.getTotalInstanceWeight(serviceInstances);
            
            /** 
             * Generate a random number from 0 to (Total Instance Weight)  
            */
            const randomWeight = Math.random() * totalInstanceWeight;

            const instance = this.getInstanceByWeightThreshold(serviceInstances, randomWeight);

            return resolve(instance.value.url);
        });
    }

    private getTotalInstanceWeight(instances: ServiceInfo[]) {
        let totalInstanceWeight = 0;

        for(const instance of instances) {
            /**
            * Not checking for undefined as value objects check themselves in the constructor
            */
            totalInstanceWeight += instance.value.balancerOptions.value.weight as number;
        }

        return totalInstanceWeight;
    }

    private getInstanceByWeightThreshold(instances: ServiceInfo[], threshold: number): ServiceInfo {
        let totalWeight = 0;
        
        /**
         * Add each instance's weight to the totalWeight,
         * return the instance that passes the threshold
         */
        for (const instance of instances) {
            totalWeight += instance.value.balancerOptions.value.weight as number;

            if (totalWeight >= threshold) {
                return instance;
            }
        }
        
        /**
         * If the loop could not find it, the threshold is larger than all the sum of the instance's weights other than the last one.
         */
        return instances[instances.length -1];
    }
}