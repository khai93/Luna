import express, { Application } from 'express';
import fs from 'fs';
import watch from 'node-watch';

import { IServiceModule } from './modules/services';
import { ServiceInfo, ServiceInfoValue } from '../common/serviceInfo';
import { getServiceInfoFiles, getServiceInfoFilesPaths, getServiceInfoFromFile } from './services';

export class ApiGatewayServer {
    private _app: Application;
    private _port: number;
    private _serviceModule: IServiceModule;

    constructor(app: Application, port: number, serviceModule: IServiceModule) {
        this._app = app;
        this._port = port;
        this._serviceModule = serviceModule;
    }

    async start() {
        const baseServiceInfoFiles = await getServiceInfoFiles();

        /**
         * Add base files at the start incase there are any services added before the Api Gateway starts up.
         */
        for (const serviceInfo of baseServiceInfoFiles) {
            await this._serviceModule.update(serviceInfo);
        }

        watch("src/services", {recursive: true, filter: /service-info\.generated\.json/}, async (evt, name) => {
            if (evt == 'update') {
                const serviceInfo = name && await getServiceInfoFromFile(name);
                
                if (serviceInfo) {
                    await this._serviceModule.update(serviceInfo);
                }                
            }
            
            if (evt == 'remove') {
                const serviceNameRegex = /services\\(.*)\\/gm;
                const serviceNamesFound = name?.match(serviceNameRegex);

                if (serviceNamesFound && serviceNamesFound.length > 0) {
                    await this._serviceModule.remove(serviceNamesFound[0]);
                }
            }

            console.log(this._serviceModule.services);
        }); 

        console.log("Watching src/services for changes");


        this._app.listen(this._port, () => {
            console.log('Api Gateway started at PORT ' + this._port);
        });
    }
}