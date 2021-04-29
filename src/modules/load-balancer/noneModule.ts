import { inject, injectable } from "tsyringe";
import { ServiceInfo } from "../../common/serviceInfo";
import { LoggerModule } from "../logger/types";
import { LoadBalancerModule } from "./types";

@injectable()
export class NoneModule implements LoadBalancerModule {
    constructor(
        @inject("LoggerModule") private logger: LoggerModule
    ) {
        this.logger.info("Load Balancer loaded with None method.");
    }

    getBalancedServiceUrl(serviceInfo: ServiceInfo): Promise<URL> {
        return new Promise((resolve, reject) => {
            return resolve(serviceInfo.value.url);
        });
    }
}