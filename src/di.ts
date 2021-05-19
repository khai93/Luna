import express from 'express';
import 'reflect-metadata';

import { container, Lifecycle } from "tsyringe";
import serviceModule from './modules/service';
import { ServiceModule } from './modules/service/types';

// Modules

container.register<ServiceModule>("ServiceModule", {
    useClass: serviceModule
}, { lifecycle: Lifecycle.ContainerScoped });



// Values

container.register("ExpressDefaultFunction", {
    useValue: express
});

container.register("ExpressRouterFunction", {
    useValue: express.Router
});


export { container }