import { ApiGatewayServer } from "./api-gateway/server";
import express from 'express';
import { MemoryServiceModule } from './api-gateway/modules/services';

const app = express();

const gatewayServer = new ApiGatewayServer(app, 8000, new MemoryServiceModule());
gatewayServer.start();