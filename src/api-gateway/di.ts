import { container, Lifecycle } from 'tsyringe';
import serviceModule from './modules/service';
import { ServiceModule } from './modules/service/types';
import express, { Application, RequestHandler, Router } from 'express';
import config from '../config';
import { Configuration } from '../config/config';
import { ApiGatewayServer } from './server';
import offlineMiddleware from './middlewares/offline';
import Middleware from '../common/middleware';
import expressHttpProxy from 'express-http-proxy';
import { ApiGatewayProxy } from './proxy';

export { container }

/** MODULES */

container.register<ServiceModule>("ServiceModule", {
    useClass: serviceModule
}, { lifecycle: Lifecycle.ContainerScoped });


/** MIDDLEWARES */

container.register<Middleware>("OfflineMiddleware", {
    useValue: offlineMiddleware
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
})


/** VALUES */

container.register<Configuration>("Configuration", {
    useValue: config
});



