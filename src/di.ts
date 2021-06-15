export const TOKENS = {
    values: {
        expressApp: Symbol(),
        expressRouter: Symbol(),
        tsLogger: Symbol(),
        config: Symbol(),
        axiosClient: Symbol(),
        fsAsync: Symbol()
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
        },
        gateway: {
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
import { ServiceModule } from './modules/service/types';
import config from './config';
import { ExpressRegistryComponent } from './components/registry/express/express';
import { NginxConfigModule } from "./modules/nginxConfig/types";
import http from 'http';
import https from 'https';
import { NginxConfModule } from "./modules/nginxConfig/nginxConfModule";
import axios, { AxiosResponse } from "axios";
import { RequestModule } from "./modules/request/types";
import { AxiosRequestModule } from "./modules/request/axiosModule";
import { ExpressGatewayComponent } from "./components/gateway/express/express";
import { MemoryServiceModule } from "./modules/service/memory";
import fs from 'fs/promises';

const httpAgent = new http.Agent({ keepAlive: true });
const httpsAgent = new https.Agent({ keepAlive: true });


// Modules

container.register<ServiceModule>(TOKENS.modules.service, {
    useClass: MemoryServiceModule
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
    useValue: new Logger({ type: "hidden" })
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

container.register(TOKENS.values.fsAsync, {
    useValue: fs
});



/** COMPONENTS */

container.register(TOKENS.components.registry.component, {
    useClass: ExpressRegistryComponent
}, {
    lifecycle: Lifecycle.ContainerScoped
});

container.register(TOKENS.components.gateway.component, {
    useClass: ExpressGatewayComponent
}, {
    lifecycle: Lifecycle.ContainerScoped
})

import expressRegistryComponentRoutes from './components/registry/express/routes';
import expressGatewayComponentRoutes from './components/gateway/express/routes';

container.register(TOKENS.components.registry.routes, {
    useValue: expressRegistryComponentRoutes
});

container.register(TOKENS.components.gateway.routes, {
    useValue: expressGatewayComponentRoutes
});


export { container }