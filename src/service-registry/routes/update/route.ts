import { Application, Request, Response, Router } from "express";
import { inject, injectable } from "tsyringe";
import { IExecuteable } from "../../../common/interfaces/IExecuteable";
import Middleware from "../../../common/middleware";
import { ServiceModule } from "../../../modules/service/types";
import { ServiceRegistryServer } from "../../server";
import { ServiceRegistryRoute } from "../ServiceRegistryRoute";

@injectable()
export class ServiceRegistryUpdateRoute implements ServiceRegistryRoute {
    constructor(
        @inject("ServiceModule") private serviceModule: ServiceModule,
        @inject("AuthMiddleware") private authMiddleware: Middleware
    ) {
    }

    execute(router: Router) {
        router.post('/', this.authMiddleware.value, (req: Request, res: Response) => {
            res.json({
                success: true
            })
        });
    }
}