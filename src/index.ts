import { ApiGatewayServer } from "./api-gateway/server";
import { ApiGatewayProxy } from './api-gateway/proxy';
import express from 'express';
import serviceModule from './api-gateway/modules/service/';
import expressHttpProxy from 'express-http-proxy';
import offlineMiddleware from './api-gateway/middlewares/offline';
const app = express();

const gatewayServer = new ApiGatewayServer({
    app,
    port: 8080,
    serviceModule
});

const gatewayProxy = new ApiGatewayProxy({
    offlineMiddleware,
    router: express.Router,
    app,
    serviceModule,
    expressHttpProxy
});

gatewayServer.start();