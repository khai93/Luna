export const TOKENS = {
    values: {
        expressApp: Symbol(),
        expressRouter: Symbol(),
        tsLogger: Symbol(),
        config: Symbol(),
        axiosClient: Symbol()
    },
    modules: {
        service: Symbol(),
        logger: Symbol(),
        nginxConfig: Symbol(),
        request: Symbol()
    },
    components: {
        registry: {
            component: Symbol(),
            routes: Symbol()
        }
    }
}

import "reflect-metadata";
import express from 'express';
import { Logger } from 'tslog';
import { container, Lifecycle } from "tsyringe";
import { TSLoggerModule } from './modules/logger/TSLoggerModule';
import { LoggerModule } from './modules/logger/types';
import serviceModule from './modules/service';
import { ServiceModule } from './modules/service/types';
import config from './config';
import { ExpressRegistryComponent } from './components/registry/express/express';
import { NginxConfigModule } from "./modules/nginxConfig/types";
import http from 'http';
import https from 'https';
import { NginxConfModule } from "./modules/nginxConfig/nginxConfModule";
import axios from "axios";

const httpAgent = new http.Agent({ keepAlive: true });
const httpsAgent = new https.Agent({ keepAlive: true });


// Modules

container.register<ServiceModule>(TOKENS.modules.service, {
    useClass: serviceModule
}, { lifecycle: Lifecycle.ContainerScoped });

container.register<LoggerModule>(TOKENS.modules.logger, {
    useClass: TSLoggerModule
});

container.register<NginxConfigModule>(TOKENS.modules.nginxConfig, {
    useClass: NginxConfModule
});

container.register<RequestModule>(TOKENS.modules.request, {
    useClass: AxiosRequestModule
});

// Values

container.register(TOKENS.values.expressApp, {
    useValue: express()
});

container.register(TOKENS.values.expressRouter, {
    useValue: express.Router
});

container.register(TOKENS.values.tsLogger, {
    useValue: new Logger()
});

container.register(TOKENS.values.config, {
    useValue: config
});

container.register(TOKENS.values.axiosClient, {
    useValue: axios.create({
        httpsAgent,
        httpAgent
    })
});



/** COMPONENTS */

container.register(TOKENS.components.registry.component, {
    useClass: ExpressRegistryComponent
}, {
    lifecycle: Lifecycle.ContainerScoped
});

import expressRegistryComponentRoutes from './components/registry/express/routes';
import { RequestModule } from "./modules/request/types";
import { AxiosRequestModule } from "./modules/request/axiosModule";
container.register(TOKENS.components.registry.routes, {
    useValue: expressRegistryComponentRoutes
});




export { container }