import { container, Lifecycle } from 'tsyringe';
import serviceModule from './modules/service';
import { ServiceModule } from './modules/service/types';
import express, { Application, RequestHandler, Router } from 'express';
import config from './config';
import { apiGatewayConfig, Configuration, serviceRegistryConfig } from './config/config';
import { ApiGatewayServer } from './api-gateway/server';
import offlineMiddleware from './api-gateway/middlewares/offline';
import Middleware from './common/middleware';
import expressHttpProxy from 'express-http-proxy';
import { ApiGatewayProxy } from './api-gateway/proxy';
import { IExecuteable } from './common/interfaces/IExecuteable';
import { ServiceRegistryRoute } from './service-registry/routes/ServiceRegistryRoute';
import ServiceRegistryUpdateRoute from './service-registry/routes/update';
import cors from 'cors';
import authMiddleware from './service-registry/middlewares/auth';
import { LoggerModule } from './modules/logger/types';
import loggerModule from './modules/logger';
import ServiceRegistryLunaRoute from './service-registry/routes/luna';

export { container }

/** MODULES */

container.register<ServiceModule>("ServiceModule", {
    useClass: serviceModule
}, { lifecycle: Lifecycle.ContainerScoped });

container.register<LoggerModule>("LoggerModule", {
    useClass: loggerModule
}, { lifecycle: Lifecycle.ContainerScoped });


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


