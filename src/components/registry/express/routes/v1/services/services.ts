import { Request, Router } from "express";
import InstanceId from "src/common/instanceId";
import { IExpressRoute } from "src/common/interfaces/IExpressRoute";
import { basicAuthMiddleware } from "src/common/middlewares/basicAuth/basicAuth";
import catchErrorAsync from "src/common/middlewares/catchErrorAsync";
import { Instance } from "src/common/instance";
import { TOKENS } from "src/di";
import { ServiceModule } from "src/modules/service/types";
import { inject, autoInjectable } from "tsyringe";
import Version from "../../../../../../common/version";


@autoInjectable()
export class ExpressRegistryServicesRoute implements IExpressRoute {
    version: Version = new Version("1");

    constructor(
        @inject(TOKENS.modules.service) private serviceModule?: ServiceModule
    ){}

    execute(router: Router) {
        router.get("/services", catchErrorAsync(async (req, res) => {
            const servicesData = await this.serviceModule!.getAll();
            const rawData = servicesData.map(service => service.raw);

            res.send(rawData);
        }));
    };
}