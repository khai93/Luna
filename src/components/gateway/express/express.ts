import express, { application, Router } from "express";
import Version from "src/common/version";
import { TOKENS } from "src/di";
import { inject, injectable } from "tsyringe";
import { IExecutable } from "../../../common/interfaces/IExecutable";
import { IExpressRoute } from "../../../common/interfaces/IExpressRoute";

@injectable()
export class ExpressGatewayComponent implements IExecutable {
    private gatewayRouterV1: Router;

    constructor(
        @inject(TOKENS.values.expressApp) private app: typeof application,
        @inject(TOKENS.values.expressRouter) private router: typeof express.Router,
        @inject(TOKENS.components.registry.routes) private registryRoutes: IExpressRoute[]
    ) { 
        this.gatewayRouterV1 = this.router();
    }

    execute(): void {
        for (const route of this.registryRoutes) {
            if (route.version.equals(new Version("1"))) {
                route.execute(this.gatewayRouterV1);
            }
        }

        this.app.use("/gateway/v1/", this.gatewayRouterV1);
    }
}