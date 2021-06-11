import { Request, Router } from "express";
import InstanceId from "src/common/instanceId";
import { IExpressRoute } from "src/common/interfaces/IExpressRoute";
import catchErrorAsync from "src/common/middlewares/catchErrorAsync";
import { ServiceInfo } from "src/common/serviceInfo";
import { TOKENS } from "src/di";
import { ServiceModule } from "src/modules/service/types";
import { inject, autoInjectable } from "tsyringe";
import Version from "../../../../../../common/version";

export type ParsedServiceRequest = {instanceIdObject: InstanceId, bodyServiceInfo?: ServiceInfo};

@autoInjectable()
export class ExpressRegistryServicesRoute implements IExpressRoute {
    version: Version = new Version("1");

    constructor(
        @inject(TOKENS.modules.service) private serviceModule?: ServiceModule
    ){}

    execute(router: Router) {
        router.get("/services", catchErrorAsync(async (req, res) => {
            const servicesData = await this.serviceModule!.getAll();
            const rawData = servicesData.map(service => service.raw);

            res.send(rawData);
        }));

        router.get("/services/:instanceId", catchErrorAsync(async (req, res) => {
            const { instanceIdObject } = await this.parseServiceRequest(req, false);
 
            const instanceData = await this.serviceModule!.findByInstanceId(instanceIdObject);

            if (instanceData == null) {
                return res.sendStatus(404);
            }

            res.send(instanceData.raw);
        }));

        router.post("/services/:instanceId", catchErrorAsync(async (req, res) => {
            const { instanceIdObject, bodyServiceInfo } = await this.parseServiceRequest(req, true);

            if (!instanceIdObject.equals(bodyServiceInfo!.value.instanceId)) {
                return res.sendStatus(400);
            }

            const foundInstance = await this.serviceModule!.findByInstanceId(instanceIdObject);

            if (foundInstance != null) {
                return res.sendStatus(400);
            }

            const addedInstance = await this.serviceModule!.add(bodyServiceInfo!);

            if (addedInstance == null) {
                return res.sendStatus(500);
            }

            return res.status(201).send(addedInstance);
        }));

        router.put("/services/:instanceId", catchErrorAsync(async (req, res) => {
            const { instanceIdObject, bodyServiceInfo } = await this.parseServiceRequest(req, true);

            if (!instanceIdObject.equals(bodyServiceInfo!.value.instanceId)) {
                return res.sendStatus(400);
            }

            const foundInstance = await this.serviceModule!.findByInstanceId(instanceIdObject);

            if (foundInstance == null) {
                return res.sendStatus(400);
            }

            const updatedInstance = await this.serviceModule!.update(bodyServiceInfo!);

            if (updatedInstance == null) {
                return res.sendStatus(500);
            }

            return res.status(200).send(updatedInstance);
        }));

        router.delete("/services/:instanceId", catchErrorAsync(async (req, res) => {
            const { instanceIdObject } = await this.parseServiceRequest(req, false);
 
            const foundInstance = await this.serviceModule!.findByInstanceId(instanceIdObject);

            if (foundInstance == null) {
                return res.sendStatus(400);
            }

            await this.serviceModule!.remove(instanceIdObject);

            return res.sendStatus(200);
        }));
    }

    private parseServiceRequest(req: Request, parseBody: boolean): Promise<ParsedServiceRequest> {
        return new Promise((resolve, reject) => {
            try {
                const { instanceId } = req.params;

                const instanceIdObject = InstanceId.fromString(instanceId);
                
                let bodyServiceInfo;

                if (parseBody) {
                    bodyServiceInfo = new ServiceInfo(req.body);
                }
                
                return resolve({
                    instanceIdObject,
                    bodyServiceInfo
                });
            } catch (e) {
                reject(e);
            }
        });
    }
}