import { Application, Request, Response, Router } from "express";
import { inject, injectable } from "tsyringe";
import { IExecuteable } from "../../../common/interfaces/IExecuteable";
import Middleware from "../../../common/middleware";
import { Name } from "../../../common/name";
import { ServiceInfo } from "../../../common/serviceInfo";
import { LoggerModule } from "../../../modules/logger/types";
import { ServiceModule } from "../../../modules/service/types";
import { ServiceRegistryServer } from "../../server";
import { ServiceRegistryRoute } from "../ServiceRegistryRoute";

@injectable()
export class ServiceRegistryUpdateRoute implements ServiceRegistryRoute {
    constructor(
        @inject("ServiceModule") private serviceModule: ServiceModule,
        @inject("AuthMiddleware") private authMiddleware: Middleware,
        @inject("LoggerModule") private logger: LoggerModule
    ) { }

    execute(router: Router) {
        router.post('/', this.authMiddleware.value, async (req: Request, res: Response) => {
            try {
                const serviceInfo = new ServiceInfo(req.body);

                const foundServiceInDatabase = await this.serviceModule.find(serviceInfo.value.name);

                let serviceInfoAdded;

                if (foundServiceInDatabase) {
                    serviceInfoAdded = await this.serviceModule.update(serviceInfo);
                } else {
                    serviceInfoAdded = await this.serviceModule.add(serviceInfo);
                }

                return res.json({success: true, service: serviceInfoAdded.value});
            } catch (e) {
                this.logger.error(e);
                return res.json({success: false, message: e.message});
            }
        });
    }
}