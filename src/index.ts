import 'reflect-metadata';
import { container } from './di';
import { ServiceRegistryServer } from './service-registry/server';
import { IExecuteable } from './common/interfaces/IExecuteable';

const registryServerInstance = container.resolve(ServiceRegistryServer);
registryServerInstance.start();

const gatewayInstance: IExecuteable = container.resolve("ApiGatewayModule");
gatewayInstance.execute();



