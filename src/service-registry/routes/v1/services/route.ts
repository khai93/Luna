import { Application, Request, Response, Router } from "express";
import { inject, injectable } from "tsyringe";
import Middleware from "../../../../common/middleware";
import { Name } from "../../../../common/name";
import { NameNotValid } from "../../../../common/name/name";
import { ServiceInfo } from "../../../../common/serviceInfo";
import { ServiceInfoNotValid } from "../../../../common/serviceInfo/serviceInfo";
import Version from "../../../../common/version";
import { Configuration } from "../../../../config/config";
import { LoggerModule } from "../../../../modules/logger/types";
import { ServiceModule } from "../../../../modules/service/types";
import { ServiceRegistryRoute } from "../../ServiceRegistryRoute";

@injectable()
export class ServiceRegistryUpdateRoute implements ServiceRegistryRoute {
    constructor(
        @inject("ServiceModule") private serviceModule: ServiceModule,
        @inject("AuthMiddleware") private authMiddleware: Middleware,
        @inject("LoggerModule") private logger: LoggerModule,
        @inject("ServiceRegistryConfig") private serviceRegistryConfig: Configuration
    ) { }

    version: Version = new Version(1);

    execute(router: Router) {
        /**
         * POST /luna/v1/services/:serviceName
         * 
         * Register a service in the database
         */
        router.post('/services/:serviceName', this.authMiddleware.value, async (req: Request, res: Response) => {
            try {
                const { serviceName, bodyServiceInfo } = this.parseRequest(req);

                const _bodyServiceInfo = bodyServiceInfo as ServiceInfo;

                const foundServiceInDatabase = await this.serviceModule.find(serviceName);

                let serviceInfoAdded;

                if (foundServiceInDatabase) {
                    throw new Error("Duplicate service id.");
                } else {
                    serviceInfoAdded = await this.serviceModule.add(_bodyServiceInfo);
                }

                return res.json({success: true, service: serviceInfoAdded.raw()});
            } catch (e) {
                this.handleError(e, res);
            }
        });

        /**
         * PUT /luna/v1/services/:serviceName
         * 
         * Update a service in the database
         * 
         * Updates count as heartbeats.
         */
         router.put('/services/:serviceName', this.authMiddleware.value, async (req: Request, res: Response) => {
            try {
                const { serviceName, bodyServiceInfo } = this.parseRequest(req);

                const _bodyServiceInfo = bodyServiceInfo as ServiceInfo;

                const foundServiceInDatabase = await this.serviceModule.find(serviceName);

                let serviceInfoUpdated;

                if (foundServiceInDatabase) {
                    const lastHeartbeatToNowDifferenceInMS = Date.now() - foundServiceInDatabase.value.last_heartbeat.getTime();
                    
                    if (Math.floor(lastHeartbeatToNowDifferenceInMS/1000) > (this.serviceRegistryConfig.registry?.heartbeat_rate as number)) {
                        this.logger.warn(`service [${serviceName.value}] was ${lastHeartbeatToNowDifferenceInMS - ((this.serviceRegistryConfig.registry?.heartbeat_rate as number) * 1000)}ms late in it's heartbeat`);
                    }

                    serviceInfoUpdated = await this.serviceModule.update(_bodyServiceInfo);
                } else {
                    return res.status(404).json({success:false, message: "Service '" + _bodyServiceInfo.raw.name + "' is not registered."});
                }

                return res.json({success: true, service: serviceInfoUpdated.raw()});
            } catch (e) {
                this.handleError(e, res);
            }
        });

        /**
         * DELETE /luna/v1/services/:serviceName
         * 
         * Delete a service in the database
         */
         router.delete('/services/:serviceName', this.authMiddleware.value, async (req: Request, res: Response) => {
            try {
                const { serviceName } = this.parseRequest(req, false);

                const foundServiceInDatabase = await this.serviceModule.find(serviceName);

                if (foundServiceInDatabase !== null) {
                    await this.serviceModule.remove(serviceName);
                } else {
                    throw new Error("Service '" + serviceName.value + "' is not registered.");
                }

                return res.json({success: true});
            } catch (e) {
                this.handleError(e, res);
            }
        });

        /**
         * GET /luna/v1/services/:serviceName
         * 
         * Get service's raw info
         */
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