import express, { Application } from 'express';
import watch from 'node-watch';
import { ServiceInfo, ServiceInfoValue } from '../common/serviceInfo';
import { Name } from '../common/name';
import { injectable, inject, scoped, Lifecycle, singleton } from 'tsyringe';
import { Configuration } from '../config/config';
import { ServiceModule } from './modules/service/types';

@singleton()
@injectable()
export class ApiGatewayServer {
    private _expressApp: Application;

    constructor(
        @inject("ExpressDefaultFunction") private express: Function,
        @inject("Configuration") private configuration: Configuration,
        @inject("ServiceModule") private serviceModule: ServiceModule
    ) {
        this._expressApp = this.express();
    }

    async start() {
        const baseServiceInfoFiles = await ServiceInfo.getServiceInfoFiles();

        /**
         * Add base files at the start incase there are any services added before the Api Gateway starts up.
         */
        for (const serviceInfo of baseServiceInfoFiles) {
            await this.serviceModule.update(serviceInfo);
        }

        watch("src/services", {recursive: true, filter: /service-info\.generated\.json/}, async (evt, name) => {
            try {
                if (evt == 'update') {
                    const serviceInfo = name && await ServiceInfo.getServiceInfoFromFile(name);
                
                    if (serviceInfo) {
                        await this.serviceModule.update(serviceInfo);
                    }                
                }
            
                if (evt == 'remove') {
                    const serviceNameRegex = /services\\(.*)\\/gm;
                    const serviceNamesFound = name?.match(serviceNameRegex);

                    if (serviceNamesFound && serviceNamesFound.length > 0) {
                        await this.serviceModule.remove(new Name(serviceNamesFound[0]));
                    }
                }
            } catch (e) {
                console.error(e);
            }
        }); 

        console.log("Watching src/services for changes");


        this._expressApp.listen(this.configuration.server.port, () => {
            console.log('Api Gateway started at PORT ' + this.configuration.server.port);
        });
    }

    get expressApp(): Application {
        return this._expressApp;
    }
}