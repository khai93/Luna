import { container, TOKENS } from './di';
import express, { application, ErrorRequestHandler } from 'express';
import { IExecutable } from "./common/interfaces/IExecutable";
import { LoggerModule } from "./modules/logger/types";
import config from './config';


const expressApp = container.resolve<typeof application>(TOKENS.values.expressApp);
expressApp.use(express.json());
expressApp.use(express.urlencoded({ extended: true }));


const registryComponent = container.resolve<IExecutable>(TOKENS.components.registry.component);
registryComponent.execute();

const loggerModule = container.resolve<LoggerModule>(TOKENS.modules.logger);

const expressErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
    loggerModule.error(err);

    return res.status(500).send({
        error: err.toString()
    });
}

expressApp.use(expressErrorHandler);


expressApp.listen(config.registry.port, () => loggerModule.log("Luna registry server started at PORT " + config.registry.port));