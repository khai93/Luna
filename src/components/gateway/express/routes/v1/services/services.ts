import { AxiosResponse } from "axios";
import { Router } from "express";
import { IExpressRoute } from "src/common/interfaces/IExpressRoute";
import catchErrorAsync from "src/common/middlewares/catchErrorAsync";
import { Name } from "src/common/name";
import Version from "src/common/version";
import { LunaBalancerComponent } from "src/components/balancer/luna/luna";
import { TOKENS } from "src/di";
import { RequestModule, RequestOptions } from "src/modules/request/types";
import { ServiceModule } from "src/modules/service/types";
import { autoInjectable, inject } from "tsyringe";

@autoInjectable()
export class ExpressGatewayServicesRoute implements IExpressRoute {
    version: Version = new Version("1");

    constructor(
        @inject(TOKENS.modules.service) private serviceModule?: ServiceModule,
        @inject(TOKENS.modules.request) private requestModule?: RequestModule,
        @inject(TOKENS.components.balancer.luna) private balancerComponent?: LunaBalancerComponent
    ) {}

    execute(router: Router) {
        router.use("/services/:serviceName", catchErrorAsync(async (req, res) => {
            const { serviceName } = req.params;

            const services = await this.serviceModule?.findAllByName(new Name(serviceName));

            if (services == null || services?.length <= 0) {
                throw new Error("Service name provided has no instances registered.");
            }

            const instance = await this.balancerComponent?.getNextInstance(new Name(serviceName));
            
            if (instance == null) {
                throw new Error("Balancer unexpectedly could not find an instance");
            }

            const splitReqUrl = req.url.split("/services/" + instance.raw.name);
            const instanceUrl = instance.value.url.toString() + (splitReqUrl[splitReqUrl.length - 1] == "/" ? "" : splitReqUrl[splitReqUrl.length - 1]);

            const proxyRequestOptions: RequestOptions = {
                url: instanceUrl,
                method: req.method,
                responseType: 'stream',
                body: req.body,
                headers: req.headers,
            };

            const response = await this.requestModule?.request<AxiosResponse>(proxyRequestOptions);
            
            response?.data.pipe(res);
        }));

        router.get("/services", catchErrorAsync(async (req, res) => {
            res.sendStatus(200);
        }));
    }
}