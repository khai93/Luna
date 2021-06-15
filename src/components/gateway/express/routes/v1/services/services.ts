import { Router } from "express";
import { IExpressRoute } from "src/common/interfaces/IExpressRoute";
import catchErrorAsync from "src/common/middlewares/catchErrorAsync";
import { Name } from "src/common/name";
import Version from "src/common/version";
import { TOKENS } from "src/di";
import { RequestModule } from "src/modules/request/types";
import { ServiceModule } from "src/modules/service/types";
import { inject } from "tsyringe";

export class ExpressGatewayServicesRoute implements IExpressRoute {
    version: Version = new Version("1");

    constructor(
        @inject(TOKENS.modules.service) private serviceModule?: ServiceModule,
        @inject(TOKENS.modules.request) private requestModule?: RequestModule
    ) {}

    execute(router: Router) {
        router.use("/services/:serviceName", catchErrorAsync(async (req, res) => {
            const { serviceName } = req.params;

            const services = await this.serviceModule?.findAllByName(new Name(serviceName));

            if (services == null || services?.length <= 0) {
                throw new Error("Service name provided has no instances registered.");
            }

            
        }));

        router.get("/services", catchErrorAsync(async (req, res) => {
            res.sendStatus(200);
        }));
    }
}