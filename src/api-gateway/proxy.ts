
import { Application, RequestHandler, Router } from "express";
import { injectable, inject, scoped, Lifecycle } from "tsyringe";
import Middleware from "../common/middleware";
import { Name } from "../common/name";
import { ServiceInfo } from "../common/serviceInfo";
import { ServiceModule } from "./modules/service/types";
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
    private _router: Router;
    private _app: Application;

    constructor(
        private apiGatewayServer: ApiGatewayServer,
        @inject("ServiceModule") private serviceModule: ServiceModule,
        @inject("OfflineMiddleware") private offlineMiddleware: Middleware,
        @inject("ExpressRouterFunction") private router: Function,
        @inject("ExpressHttpProxy") private expressHttpProxy: Function
    ) {
        console.log("Api Gateway Proxy Started");

        this._router = this.router();
        this._app = this.apiGatewayServer.expressApp;

        this._app.use("/api", (req, res, next) => { console.log("hi"); this._router(req, res, next)});
        this.serviceModule.on('update', (updatedServiceInfo: ServiceInfo, updatedServiceInfoIndex: number) => {
            console.log(`Service [${updatedServiceInfo.value.name}] updated.`);
            this.updateServiceProxy(updatedServiceInfo);
        });
    }

    private updateServiceProxy(serviceInfo: ServiceInfo) {
        this._router = this.router();

        const serviceEndpoint = new URL((serviceInfo.value.https ? "https://" : "http://") + serviceInfo.value.host + ":" + serviceInfo.value.port);
        
        let newServiceMethod: ServiceMethod = {
            serviceInfo,
            handler: serviceInfo.value.online ? this.expressHttpProxy(serviceEndpoint) : this.offlineMiddleware.value
        };


        const serviceMethodIndexFound = this._serviceMethods.findIndex(method => method.serviceInfo.sameAs(serviceInfo));

        if (serviceMethodIndexFound >= 0) {
            this._serviceMethods[serviceMethodIndexFound] = newServiceMethod;
        } else {
            this._serviceMethods.push(newServiceMethod);
        }

        for (const serviceMethod of this._serviceMethods) {
            this._router.use('/' + serviceMethod.serviceInfo.value.name, serviceMethod.handler);
        }
    }
}