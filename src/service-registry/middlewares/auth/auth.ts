import { RequestHandler } from "express";
import Middleware from "../../../common/middleware";
import { Configuration } from "../../../config/config";
import { container } from '../../../di';

const authRequestHandler: RequestHandler = (req, res, next): void => {
    const registryServiceConfig: Configuration = container.resolve("ServiceRegistryConfig");
    
    /**
     * If auth object exists on config and username is defined then there is a valid basic auth.
     */
    let registryServiceAuthString;

    if (registryServiceConfig.server.auth && registryServiceConfig.server.auth.username) {
        registryServiceAuthString = registryServiceConfig.server.auth.username + ":" + registryServiceConfig.server.auth.password;
    }

    if (registryServiceConfig && registryServiceAuthString) {


        const configBasicAuthString = `Basic ${btoa(registryServiceAuthString)}`;

        if (req.headers.authorization !== configBasicAuthString) {
            res.status(401).send("Authorization Failed.");
            return;
        }
    }

    next();
}

export const authMiddleware = new Middleware(authRequestHandler);