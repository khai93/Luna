import { Name } from "src/common/name";
import { ServiceInfo } from "src/common/serviceInfo";
import config from "src/config";
import { TOKENS } from "src/di";
import { inject, injectable } from "tsyringe";
import { LoadBalancer, LoadBalancerType } from "../types";
import { NginxRoundRobinBalancer } from "./roundRobin";
import { NginxWeightedRoundRobinBalancer } from "./weightedRoundRobin";

@injectable()
export class NginxBalancerComponent implements LoadBalancer {
    private balancer: LoadBalancer;

    constructor(
        @inject(TOKENS.values.config) private _config: typeof config
    ) {
        switch(_config.balancer) {
            case LoadBalancerType.None:
                this.balancer = new NginxRoundRobinBalancer();
                break;
            case LoadBalancerType.RoundRobin:
                this.balancer = new NginxRoundRobinBalancer();
                break;
            case LoadBalancerType.WeightedRoundRobin:
                this.balancer = new NginxWeightedRoundRobinBalancer();
                break;
            default:
                this.balancer = new NginxRoundRobinBalancer();
        }
    }

    balanceService(serviceName: Name, currentInstance?: ServiceInfo): Promise<ServiceInfo> {
        return this.balancer.balanceService(serviceName, currentInstance);
    }
}