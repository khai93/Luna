import { container, Lifecycle } from 'tsyringe';
import serviceModule from './modules/service';
import { ServiceModule } from './modules/service/types';
import express from 'express';
import { apiGatewayConfig, Configuration, serviceRegistryConfig } from './config/config';
import offlineMiddleware from './api-gateway/middlewares/offline';
import Middleware from './common/middleware';
import expressHttpProxy from 'express-http-proxy';
import { ServiceRegistryRoute } from './service-registry/routes/ServiceRegistryRoute';
import ServiceRegistryUpdateRoute from './service-registry/routes/v1/services';
import cors from 'cors';
import authMiddleware from './service-registry/middlewares/auth';
import { LoggerModule } from './modules/logger/types';
import loggerModule from './modules/logger';
import ServiceRegistryLunaRoute from './service-registry/routes/v1/luna';
import compression from 'compression';
import { LoadBalancerModule } from './modules/load-balancer/types';
import loadBalancerModules from './modules/load-balancer';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { Logger } from 'tslog';
import shelljs from 'shelljs';
const NginxConfFile = require('nginx-conf').NginxConfFile;
import fsPromise from 'fs/promises';

import { NginxModule } from './modules/api-gateway/nginxModule';

export { container }

/** MODULES */

container.register<ServiceModule>("ServiceModule", {
    useClass: serviceModule
}, { lifecycle: Lifecycle.ContainerScoped });

container.register<LoggerModule>("LoggerModule", {
    useClass: loggerModule
}, { lifecycle: Lifecycle.ContainerScoped });

container.register<NginxModule>("NginxModule", {
    useClass: NginxModule
}, { lifecycle: Lifecycle.ContainerScoped });


/**
 * Injects the module that is found with the same enum as the config
 */

let loadBalancerModule = loadBalancerModules.find(moduleType => moduleType.type === apiGatewayConfig.balancer)?.module;

if (loadBalancerModule == null) {
    throw new Error(`The Load balancer Type '${apiGatewayConfig.balancer}' in config does not match any of the supported types. To not use a load balancer, use 'None' type.`);
}

container.register<LoadBalancerModule>("LoadBalancerModule", {
    useClass: loadBalancerModule
}, { lifecycle: Lifecycle.ContainerScoped })


/** MIDDLEWARES */

container.register<Middleware>("OfflineMiddleware", {
    useValue: offlineMiddleware
});

container.register<Middleware>("AuthMiddleware", {
    useValue: authMiddleware
});


/** ROUTES */

// ServiceRegistry
container.register<ServiceRegistryRoute>("ServiceRegistryRoute", {
    useClass: ServiceRegistryUpdateRoute
});

container.register<ServiceRegistryRoute>("ServiceRegistryRoute", {
    useClass: ServiceRegistryLunaRoute
});


/** FUNCTIONS */


container.register("ExpressDefaultFunction", {
    useValue: express
});

container.register("ExpressRouterFunction", {
    useValue: express.Router
});

container.register("ExpressHttpProxy", {
    useValue: expressHttpProxy
});

container.register("ExpressCORSFunction", {
    useValue: cors
});

container.register("ExpressGzipFunction", {
    useValue: compression
});

container.register("CreateProxyMiddleware", {
    useValue: createProxyMiddleware
});


/** DEPENDENCIES */
container.register<typeof NginxConfFile>('NginxConf', {
    useValue: NginxConfFile
});

container.register<typeof shelljs>('ShellJs', {
    useValue: shelljs
});

container.register<typeof fsPromise>('FsPromise', {
    useValue: fsPromise
});


/** VALUES */

container.register<Configuration>("ServiceRegistryConfig", {
    useValue: serviceRegistryConfig
});

container.register<Configuration>("ApiGatewayConfig", {
    useValue: apiGatewayConfig
});

container.register<Function>("ExpressBodyParser", {
    useValue: express.json
});

container.register<Logger>("TslogLogger", {
    useValue: new Logger()
});