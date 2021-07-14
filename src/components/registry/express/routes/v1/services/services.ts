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
import { IKeyValuePair } from "src/common/interfaces/IKeyValuePair";
import { InstanceRaw } from "src/common/instance/instance";


@autoInjectable()
export class ExpressRegistryServicesRoute implements IExpressRoute {
    version: Version = new Version("1");

    constructor(
        @inject(TOKENS.modules.service) private serviceModule?: ServiceModule
    ){}

    execute(router: Router) {
        router.get("/services", catchErrorAsync(async (req, res) => {
            const instances = await this.serviceModule!.getAll();

            const instancesByServiceName = instances.reduce<IKeyValuePair<InstanceRaw[]>>((acc, curr) => {
                if (acc[curr.value.name.value] == null) {
                    acc[curr.value.name.value] = [];
                }

                acc[curr.value.name.value].push(curr.raw);

                return acc;
            }, {});

            console.log(instancesByServiceName);
            
            res.render("services", { services: instancesByServiceName });
        }));
    };
}