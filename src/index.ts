import 'reflect-metadata';
import { container } from './api-gateway/di';
import { ApiGatewayProxy } from './api-gateway/proxy';
import { ApiGatewayServer } from './api-gateway/server';

const gatewayServerInstance = container.resolve(ApiGatewayServer);
gatewayServerInstance.start();

const gatewayProxyInstance = container.resolve(ApiGatewayProxy);