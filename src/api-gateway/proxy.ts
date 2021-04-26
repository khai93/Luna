
import { Application, RequestHandler, Router } from "express";
import { injectable, inject, scoped, Lifecycle } from "tsyringe";
import Middleware from "../common/middleware";
import { Name } from "../common/name";
import { ServiceInfo } from "../common/serviceInfo";
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
        @inject("ExpressHttpProxy") private expressHttpProxy: Function,
        @inject("LoggerModule") private logger: LoggerModule
    ) {
        this.logger.log("Api Gateway Proxy Started");

        this._router = this.router();
        this._app = this.apiGatewayServer.expressApp;

        this._app.use("/api", (req, res, next) => { this._router(req, res, next) });
        
        this.serviceModule.on('update', (updatedServiceInfo: ServiceInfo, updatedServiceInfoIndex: number) => {
            this.logger.log(`Service [${updatedServiceInfo.value.name.value}] updated.`);
            this.updateServiceProxy(updatedServiceInfo);
        });

        this.serviceModule.on('remove', (removedServiceName: Name) => {
            this.logger.log(`Service [${removedServiceName.value}] deregistered.`);
            this.removeServiceProxy(removedServiceName);
        });

        this.serviceModule.on('add', (addedServiceInfo: ServiceInfo) => {
            this.logger.log(`Service [${addedServiceInfo.value.name.value}] registered.`);
            this.updateServiceProxy(addedServiceInfo);
        });

    }

    private updateServiceProxy(serviceInfo: ServiceInfo) {
        this._router = this.router();

        const serviceEndpoint = new URL((serviceInfo.value.https ? "https://" : "http://") + serviceInfo.value.host + ":" + serviceInfo.value.port);
        
        let newServiceMethod: ServiceMethod = {
            serviceInfo,
            handler: serviceInfo.value.online ? this.expressHttpProxy(serviceEndpoint) : this.offlineMiddleware.value
        };

        const serviceMethodIndexFound = this._serviceMethods.findIndex(method => method.serviceInfo.equals(serviceInfo));

        if (serviceMethodIndexFound >= 0) {
            this._serviceMethods[serviceMethodIndexFound] = newServiceMethod;
        } else {
            this._serviceMethods.push(newServiceMethod);
        }


        for (const serviceMethod of this._nonNullServiceMethods()) {
            this._router.use('/' + serviceMethod && serviceMethod.serviceInfo.value.name.value, serviceMethod.handler);
        }
    }

    private removeServiceProxy(serviceName: Name) {
        this._router = this.router();

        const serviceMethodIndexFound = this._nonNullServiceMethods().findIndex(method => method.serviceInfo.value.name.equals(serviceName));

        if (serviceMethodIndexFound >= 0) {
            delete this._serviceMethods[serviceMethodIndexFound];
        }

        for (const serviceMethod of this._nonNullServiceMethods()) {
            this._router.use('/' + serviceMethod.serviceInfo.value.name.value, serviceMethod.handler);
        }
    }
}