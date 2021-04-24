import { Application, Request, Response, Router } from "express";
import { inject, injectable } from "tsyringe";
import Middleware from "../../../../common/middleware";
import { Name } from "../../../../common/name";
import { NameNotValid } from "../../../../common/name/name";
import { ServiceInfo } from "../../../../common/serviceInfo";
import { ServiceInfoNotValid } from "../../../../common/serviceInfo/serviceInfo";
import Version from "../../../../common/version";
import { LoggerModule } from "../../../../modules/logger/types";
import { ServiceModule } from "../../../../modules/service/types";
import { ServiceRegistryRoute } from "../../ServiceRegistryRoute";

@injectable()
export class ServiceRegistryUpdateRoute implements ServiceRegistryRoute {
    constructor(
        @inject("ServiceModule") private serviceModule: ServiceModule,
        @inject("AuthMiddleware") private authMiddleware: Middleware,
        @inject("LoggerModule") private logger: LoggerModule
    ) { }

    version: Version = new Version(1);

    execute(router: Router) {
        /**
         * POST /luna/v1/services/:serviceName
         * 
         * Register/Update a service in the database
         */
        router.post('/services/:serviceName', this.authMiddleware.value, async (req: Request, res: Response) => {
            try {
                const { serviceName, bodyServiceInfo } = this.parseRequest(req);

                const _bodyServiceInfo = bodyServiceInfo as ServiceInfo;

                const foundServiceInDatabase = await this.serviceModule.find(serviceName);

                let serviceInfoAdded;

                if (foundServiceInDatabase) {
                    serviceInfoAdded = await this.serviceModule.update(_bodyServiceInfo);
                } else {
                    serviceInfoAdded = await this.serviceModule.add(_bodyServiceInfo);
                }

                return res.json({success: true, service: serviceInfoAdded.raw()});
            } catch (e) {
                this.handleError(e, res);
            }
        });

        router.get('/services/:serviceName', this.authMiddleware.value, async (req: Request, res: Response) => {
            try {
                const { serviceName } = this.parseRequest(req, false);

                const foundServiceInDatabase = await this.serviceModule.find(serviceName);

                if (foundServiceInDatabase === null) {
                    throw new Error("Service requested is not registered.");
                }

                return res.json({success: true, service: foundServiceInDatabase.raw()})
            } catch (e) {
                this.handleError(e, res);
            }
        });
    }

    private parseRequest(req: Request, checkBody: boolean = true): {serviceName: Name, bodyServiceInfo?: ServiceInfo} {
        const serviceName = new Name(req.params.serviceName);
        
        let bodyServiceInfo;

        if (checkBody) {
            bodyServiceInfo = new ServiceInfo(req.body);

            if (!bodyServiceInfo.value.name.sameAs(serviceName)) {
                throw new ParseRequestError("Body's service name value does not match the url param's value.");
            }
        }

        return {
            serviceName,
            bodyServiceInfo
        }
    }

    private handleError(e: Error, res: Response): void {
        const isBadRequest = this.isBadRequest(e);

        this.logger.error(e);

        res.status(isBadRequest ? 400 : 500).json({success: false, message: e.message});
    }

    /**
     * Checks if an error is a client-side error
     * @param e Error
     * @returns boolean
     */
    private isBadRequest(e: Error): boolean {
        return e instanceof ParseRequestError &&
               e instanceof NameNotValid &&
               e instanceof ServiceInfoNotValid;
    }
}

class ParseRequestError extends Error {
    constructor(message : string) {
        super(message);

        this.name = this.constructor.name;
        this.stack = new Error().stack;
    }
}