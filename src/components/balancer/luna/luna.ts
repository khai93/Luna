import { IExecutable } from "src/common/interfaces/IExecutable";
import { Name } from "src/common/name";
import { Instance } from "src/common/instance";
import config from "src/config";
import { TOKENS } from "src/di";
import { ServiceModule } from "src/modules/service/types";
import { inject, injectable } from "tsyringe";
import { LoadBalancer, LoadBalancerType } from "../types";
import { LunaNoneBalancer } from "./none";
import { LunaRoundRobinBalancer } from "./roundRobin";
import { LunaWeightedRoundRobinBalancer } from "./weightedRoundRobin";


@injectable()
export class LunaBalancerComponent {
    private balancer: LoadBalancer;

    constructor(
        @inject(TOKENS.modules.service) private serviceModule: ServiceModule,
        @inject(TOKENS.values.config) private _config: typeof config
    ){
        switch(_config.balancer) {
            case LoadBalancerType.None:
                this.balancer = new LunaNoneBalancer();
                break;
            case LoadBalancerType.RoundRobin:
                this.balancer = new LunaRoundRobinBalancer();
                break;
            case LoadBalancerType.WeightedRoundRobin:
                this.balancer = new LunaWeightedRoundRobinBalancer();
                break;
            default:
                this.balancer = new LunaRoundRobinBalancer();
        }
    }
    
    getNextInstance(serviceName: Name): Promise<Instance> {
        return new Promise(async (resolve, reject) => {
            const balancedInstance = await this.balancer.balanceService(serviceName);

            return resolve(balancedInstance);
        });
    }
}