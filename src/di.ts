export const TOKENS = {
    values: {
        expressApp: Symbol(),
        expressRouter: Symbol(),
        tsLogger: Symbol(),
        config: Symbol()
    },
    modules: {
        service: Symbol(),
        logger: Symbol()
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

// Modules

container.register<ServiceModule>(TOKENS.modules.service, {
    useClass: serviceModule
}, { lifecycle: Lifecycle.ContainerScoped });

container.register<LoggerModule>(TOKENS.modules.logger, {
    useClass: TSLoggerModule
}, { lifecycle: Lifecycle.ContainerScoped });


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



/** COMPONENTS */

container.register(TOKENS.components.registry.component, {
    useClass: ExpressRegistryComponent
}, {
    lifecycle: Lifecycle.ContainerScoped
});

import expressRegistryComponentRoutes from './components/registry/express/routes';
container.register(TOKENS.components.registry.routes, {
    useValue: expressRegistryComponentRoutes
})




export { container }