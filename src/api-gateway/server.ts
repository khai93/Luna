import { Application } from 'express';
import { inject, singleton } from 'tsyringe';
import { Configuration } from '../config/config';
import { LoggerModule } from '../modules/logger/types';

@singleton()
export class ApiGatewayServer {
    private _expressApp: Application;

    constructor(
        @inject("ExpressDefaultFunction") private express: Function,
        @inject("ApiGatewayConfig") private apiGatewayConfig: Configuration,
        @inject("LoggerModule") private logger: LoggerModule,
        @inject("ExpressGzipFunction") private compression: Function
    ) {
        this._expressApp = this.express();
    }

    async start() {
        this._expressApp.use(this.compression());
        
        this._expressApp.listen(this.apiGatewayConfig.server.port, () => {
            this.logger.log('Api Gateway started at PORT ' + this.apiGatewayConfig.server.port);
        });
    }

    get expressApp(): Application {
        return this._expressApp;
    }
}