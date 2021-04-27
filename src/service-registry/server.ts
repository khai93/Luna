import { Application } from "express";
import { inject, injectable, injectAll, singleton } from "tsyringe";
import { ServiceModule } from "../modules/service/types";
import { Configuration } from "../config/config";
import { IExecuteable } from "../common/interfaces/IExecuteable";
import { ServiceRegistryRoute } from "./routes/ServiceRegistryRoute";
import { LoggerModule } from "../modules/logger/types";
import Version from "../common/version";


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
        @inject("ExpressCORSFunction") private cors: Function,
        @inject("LoggerModule") private logger: LoggerModule
    ) {
        this._expressApp = this.express();
    }

    async start() {
        const lunaRouterV1 = this.router();

        this._expressApp.use(this.cors());
        this._expressApp.use(this.bodyParser());

        for(const route of this.routes) {
            if (route.version.equals(1)) {
                route.execute(lunaRouterV1);
            }
        }

        this._expressApp.use("/luna/v1", lunaRouterV1);

        this._expressApp.listen(this.serviceRegistryConfig.server.port, () => {
            this.logger.log('Service Registry started at PORT ' + this.serviceRegistryConfig.server.port);
        });
    }

    get expressApp(): Application {
        return this._expressApp;
    }
}