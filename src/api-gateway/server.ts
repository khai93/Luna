import express, { Application } from 'express';
import fs from 'fs';
import watch from 'node-watch';

import { ServiceModule } from './modules/service/service';
import { ServiceInfo, ServiceInfoValue } from '../common/serviceInfo';
import { Name } from '../common/name';

export type ApiGatewayServerDependencies = {
    app: Application,
    port: number,
    serviceModule: ServiceModule
}

export class ApiGatewayServer {

    constructor(private dependencies: ApiGatewayServerDependencies) {}

    async start() {
        const baseServiceInfoFiles = await ServiceInfo.getServiceInfoFiles();

        /**
         * Add base files at the start incase there are any services added before the Api Gateway starts up.
         */
        for (const serviceInfo of baseServiceInfoFiles) {
            await this.dependencies.serviceModule.update(serviceInfo);
        }

        watch("src/services", {recursive: true, filter: /service-info\.generated\.json/}, async (evt, name) => {
            try {
                if (evt == 'update') {
                    const serviceInfo = name && await ServiceInfo.getServiceInfoFromFile(name);
                
                    if (serviceInfo) {
                        await this.dependencies.serviceModule.update(serviceInfo);
                    }                
                }
            
                if (evt == 'remove') {
                    const serviceNameRegex = /services\\(.*)\\/gm;
                    const serviceNamesFound = name?.match(serviceNameRegex);

                    if (serviceNamesFound && serviceNamesFound.length > 0) {
                        await this.dependencies.serviceModule.remove(new Name(serviceNamesFound[0]));
                    }
                }
            } catch (e) {
                console.error(e);
            }
        }); 

        console.log("Watching src/services for changes");


        this.dependencies.app.listen(this.dependencies.port, () => {
            console.log('Api Gateway started at PORT ' + this.dependencies.port);
        });
    }
}