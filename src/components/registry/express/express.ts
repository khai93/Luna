import express, { application, Router } from "express";
import Version from "src/common/version";
import { TOKENS } from "src/di";
import { inject, injectable } from "tsyringe";
import { IExecutable } from "../../../common/interfaces/IExecutable";
import { IExpressRoute } from "../../../common/interfaces/IExpressRoute";

@injectable()
export class ExpressRegistryComponent implements IExecutable {
    private registryRouterV1: Router;

    constructor(
        @inject(TOKENS.values.expressApp) private app: typeof application,
        @inject(TOKENS.values.expressRouter) private router: typeof express.Router,
        @inject(TOKENS.components.registry.routes) private registryRoutes: IExpressRoute[]
    ) { 
        this.registryRouterV1 = this.router();
    }

    execute(): void {
        for (const route of this.registryRoutes) {
            if (route.version.equals(new Version("1"))) {
                route.execute(this.registryRouterV1);
            }
        }

        this.app.use("/registry/v1/", this.registryRouterV1);
    }
}