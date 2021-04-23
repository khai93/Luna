import 'reflect-metadata';
import { container } from './di';
import { ApiGatewayProxy } from './api-gateway/proxy';
import { ApiGatewayServer } from './api-gateway/server';
import { ServiceRegistryServer } from './service-registry/server';

const registryServerInstance = container.resolve(ServiceRegistryServer);
registryServerInstance.start();

const gatewayServerInstance = container.resolve(ApiGatewayServer);
gatewayServerInstance.start();

const gatewayProxyInstance = container.resolve(ApiGatewayProxy);