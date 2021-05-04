import { inject, injectable } from "tsyringe";
import { ServiceInfo } from "../../../common/serviceInfo";
import { LoggerModule } from "../../logger/types";
import { NginxConfigContext, NginxConfigModule } from "../../nginx-config/types";
import { ServiceModule } from "../../service/types";
import { LoadBalancerModule, LoadBalancerModuleError } from "../types";

@injectable()
export class WeightedRoundRobinModule implements LoadBalancerModule {
    private _serverContext: NginxConfigContext | undefined;

    constructor(
        @inject("LoggerModule") private logger: LoggerModule,
        @inject("ServiceModule") private serviceModule: ServiceModule,
        @inject("NginxConfigModule") private nginxConfigModule: NginxConfigModule
    ){
        this.logger.info("Load Balancer loaded with Weighted Round Robin method.");
     }

    async balanceService(instance: ServiceInfo): Promise<void> {
        if (this._serverContext == null) {
            this._serverContext = await this.nginxConfigModule.getServerContext();
        }

        const serviceUpstreamContext = this.nginxConfigModule.getServiceUpstreamContext(instance);
        const serviceWeight = instance.value.balancerOptions.value.weight != null ? `weight=${instance.value.balancerOptions.value.weight}` : '';

        const instanceAlreadyAdded = serviceUpstreamContext?.getDirectives('server')
                               ?.some(directive => directive.params[0] === instance.value.url.host);
        
        if (!instanceAlreadyAdded) {
            serviceUpstreamContext?.addDirective({
                name: 'server',
                params: [instance.value.url.host, serviceWeight]
            });
        } else {
            const directive = serviceUpstreamContext?.getDirectives('server')
                              ?.find(directive => directive.params[0] === instance.value.url.host);
 
            if (directive && directive.params.length < 2) {
                serviceUpstreamContext?.editDirective(directive, {
                    name: directive.name,
                    params: [
                        directive.params[0],
                        serviceWeight
                    ]
                });
            }
        };

        const serviceLocationContext = this.nginxConfigModule.getServiceLocationContext(instance);

        if (serviceLocationContext == null) {
            this.logger.error(new LoadBalancerModuleError("Service Location Context was unexpectedly undefined"));
        }
    }
}