import { Application, RequestHandler, Router } from "express";
import { Name } from "../common/name";
import { ServiceInfo } from "../common/serviceInfo";
import { ServiceModule } from "./modules/service/service";

export type ApiGatewayProxyDependencies = {
    app: Application,
    serviceModule: ServiceModule,
    offlineMiddleware: RequestHandler,

    /**
     * Express.Router()
     */
    router: Function

    /**
     * NPM package express-http-proxy's default export
     */
    expressHttpProxy: Function
}

export type ServiceMethod = {
    serviceInfo: ServiceInfo,
    handler: RequestHandler
}

/**
 * Handles the proxying requests from the gateway to the actual service hosts
 */
export class ApiGatewayProxy {
    private _serviceMethods: ServiceMethod[] = [];
    private _router: Router;

    constructor(private dependencies: ApiGatewayProxyDependencies) {
        this._router = this.dependencies.router();
        this.dependencies.app.use("/api", (req, res ,next) => {this._router(req, res, next)});
        this.dependencies.serviceModule.on('update', (updatedServiceInfo: ServiceInfo, updatedServiceInfoIndex: number) => {
            console.log(`Service [${updatedServiceInfo.value.name}] updated.`);
            this.updateServiceProxy(updatedServiceInfo);
        });
    }

    private updateServiceProxy(serviceInfo: ServiceInfo) {
        this._router = this.dependencies.router();

        const serviceEndpoint = new URL((serviceInfo.value.https ? "https://" : "http://") + serviceInfo.value.host + ":" + serviceInfo.value.port);
        
        let newServiceMethod: ServiceMethod = {
            serviceInfo,
            handler: serviceInfo.value.online ? this.dependencies.expressHttpProxy(serviceEndpoint) : this.dependencies.offlineMiddleware
        };

        const serviceMethodIndexFound = this._serviceMethods.findIndex(method => method.serviceInfo.sameAs(serviceInfo));

        if (serviceMethodIndexFound >= 0) {
            this._serviceMethods[serviceMethodIndexFound] = newServiceMethod;
        } else {
            this._serviceMethods.push(newServiceMethod);
        }   

        console.log(this._serviceMethods);

        for (const serviceMethod of this._serviceMethods) {
            this._router.use('/' + serviceMethod.serviceInfo.value.name, serviceMethod.handler);
        }
    }
}