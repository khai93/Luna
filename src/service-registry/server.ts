import { Application } from "express";
import { inject, injectable, injectAll, singleton } from "tsyringe";
import { ServiceModule } from "../modules/service/types";
import { Configuration } from "../config/config";
import { IExecuteable } from "../common/interfaces/IExecuteable";
import { ServiceRegistryRoute } from "./routes/ServiceRegistryRoute";


@singleton()
@injectable()
export class ServiceRegistryServer {
    private _expressApp: Application;

    constructor(
        @inject("ExpressDefaultFunction") private express: Function,
        @inject("ServiceRegistryConfig") private serviceRegistryConfig: Configuration,
        @inject("ServiceModule") private serviceModule: ServiceModule,
        @injectAll("ServiceRegistryRoute") private routes: ServiceRegistryRoute[],
        @inject("ExpressBodyParser") private bodyParser: Function,
        @inject("ExpressRouterFunction") private router: Function,
        @inject("ExpressCORSFunction") private cors: Function
    ) {
        this._expressApp = this.express();
    }

    async start() {
        const lunaRouter = this.router();

        this._expressApp.use(this.cors());
        this._expressApp.use(this.bodyParser());

        for(const route of this.routes) {
            route.execute(lunaRouter);
        }

        this._expressApp.use("/luna", lunaRouter);

        this._expressApp.listen(this.serviceRegistryConfig.server.port, () => {
            console.log('Service Registry started at PORT ' + this.serviceRegistryConfig.server.port);
        });
    }

    get expressApp(): Application {
        return this._expressApp;
    }
}