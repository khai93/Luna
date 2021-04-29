
import { Application, RequestHandler, Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { injectable, inject, scoped, Lifecycle } from "tsyringe";
import InstanceId from "../common/instanceId";
import Middleware from "../common/middleware";
import { Name } from "../common/name";
import { ServiceInfo } from "../common/serviceInfo";
import { Status } from "../common/status/status";
import { LoadBalancerModule } from "../modules/load-balancer/types";
import { LoggerModule } from "../modules/logger/types";
import { ServiceModule } from "../modules/service/types";
import { ApiGatewayServer } from "./server";


export type ServiceMethod = {
    serviceInfo: ServiceInfo,
    handler: RequestHandler
}

/**
 * Handles the proxying requests from the gateway to the actual service hosts
 */
@scoped(Lifecycle.ContainerScoped)
@injectable()
export class ApiGatewayProxy {
    private _serviceMethods: ServiceMethod[] = [];
    private _nonNullServiceMethods = (): ServiceMethod[] => this._serviceMethods.filter(method => method !== null);
    private _router: Router;
    private _app: Application;

    constructor(
        private apiGatewayServer: ApiGatewayServer,
        @inject("ServiceModule") private serviceModule: ServiceModule,
        @inject("OfflineMiddleware") private offlineMiddleware: Middleware,
        @inject("ExpressRouterFunction") private router: Function,
        @inject("CreateProxyMiddleware") private _createProxyMiddleware: typeof createProxyMiddleware,
        @inject("LoggerModule") private logger: LoggerModule,
        @inject("LoadBalancerModule") private loadBalancerModule: LoadBalancerModule | null
    ) {
        this.logger.log("Api Gateway Proxy Started");

        this._router = this.router();
        this._app = this.apiGatewayServer.expressApp;

        this._app.use("/api", (req, res, next) => { this._router(req, res, next) });
        
        this.serviceModule.on('update', (updatedServiceInfo: ServiceInfo, updatedServiceInfoIndex: number) => {
            this.logger.log(`Service [${updatedServiceInfo.value.name.value}] updated.`);
            this.updateServiceProxy(updatedServiceInfo);
        });

        this.serviceModule.on('remove', (removedInstanceId: InstanceId) => {
            this.logger.log(`Service [${removedInstanceId.raw().serviceName}] deregistered.`);
            this.removeServiceProxy(removedInstanceId.value.serviceName);
        });

        this.serviceModule.on('add', (addedServiceInfo: ServiceInfo) => {
            this.logger.log(`Service [${addedServiceInfo.value.name.value}] registered.`);
            this.updateServiceProxy(addedServiceInfo);
        });

    }

    private async updateServiceProxy(serviceInfo: ServiceInfo) {
        this._router = this.router();

        const getServiceUrl = async (): Promise<string> => {
            const serviceUrl = await this.loadBalancerModule?.getBalancedServiceUrl(serviceInfo);

            if (serviceUrl) {
                return Promise.resolve(serviceUrl.toString());
            } else {
                this.logger.warn("Load balancer could not find a url for service '" + serviceInfo.raw.name +"'");
                return Promise.resolve(serviceInfo.value.url.toString());
            }
        }
      
        // TODO: IMPLEMENT STATUS TO IDENTIFY SERVICES THAT CAN NOT TAKE REQUESTS ANYMORE
        let newServiceMethod: ServiceMethod = {
            serviceInfo,
            handler: !serviceInfo.value.status.equals(new Status("DOWN")) ? 
                     this._createProxyMiddleware( {
                        target: serviceInfo.value.url.toString(),
                        router: getServiceUrl,
                        pathRewrite: {
                            ['^/api/' + serviceInfo.value.name.value]: '/'
                        }
                     }):
                     this.offlineMiddleware.value
        };

        const serviceMethodIndexFound = this._nonNullServiceMethods().findIndex(method => method.serviceInfo.equals(serviceInfo));

       
        if (serviceMethodIndexFound >= 0) {
            this._serviceMethods[serviceMethodIndexFound] = newServiceMethod;
        } else {
            this._serviceMethods.push(newServiceMethod);
        }

        for (const serviceMethod of this._nonNullServiceMethods()) {
            const route = '/' + serviceMethod.serviceInfo.raw().name;

            if (serviceMethod != null && route.trim() != '/') {
                this._router.use(route, serviceMethod.handler);
            }
        }
    }

    private removeServiceProxy(serviceName: Name) {
        this._router = this.router();

        const serviceMethodIndexFound = this._nonNullServiceMethods().findIndex(method => method.serviceInfo.value.name.equals(serviceName));

        if (serviceMethodIndexFound >= 0) {
            delete this._serviceMethods[serviceMethodIndexFound];
        }

        for (const serviceMethod of this._nonNullServiceMethods()) {
            console.log(serviceMethod);
            this._router.use('/' + serviceMethod.serviceInfo.value.name.value, serviceMethod.handler);
        }
    }
}