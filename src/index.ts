import 'reflect-metadata';
import { container } from './di';
import { ApiGatewayProxy } from './api-gateway/proxy';
import { ApiGatewayServer } from './api-gateway/server';
import { ServiceRegistryServer } from './service-registry/server';
import { apiGatewayConfig, ApiGatewayType } from './config/config';
import { NginxModule } from './modules/api-gateway/nginxModule';

const registryServerInstance = container.resolve(ServiceRegistryServer);
registryServerInstance.start();

if (apiGatewayConfig.apiGateway === ApiGatewayType.Luna) {
    const gatewayServerInstance = container.resolve(ApiGatewayServer);
    gatewayServerInstance.start();

    container.resolve(ApiGatewayProxy);
}

if (apiGatewayConfig.apiGateway === ApiGatewayType.Nginx) {
    const nginxInstance: NginxModule = container.resolve("NginxModule");
    nginxInstance.execute();
}


