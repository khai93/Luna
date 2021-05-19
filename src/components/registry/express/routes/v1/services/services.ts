import { Router } from "express";
import InstanceId from "src/common/instanceId";
import { ServiceInfo } from "src/common/serviceInfo";
import { ServiceModule } from "src/modules/service/types";
import { inject, injectable } from "tsyringe";
import Version from "../../../../../../common/version";
import { ExpressRegistryRoute } from "../../../ExpressRegistryRoute";

@injectable()
export class ExpressRegistryServicesRoute implements ExpressRegistryRoute {
    version: Version = new Version("1");

    constructor(
        @inject("ServiceModule") private serviceModule: ServiceModule
    ){}

    execute(router: Router) {
        router.get("/services", async (req, res) => {
            const servicesData = await this.serviceModule.getAll();
            const rawData = servicesData.map(service => service.raw);

            res.send(rawData);
        });

        router.get("/services/:instanceId", async (req, res) => {
            const { instanceId } = req.params;

            const instanceData = await this.serviceModule.findByInstanceId(InstanceId.fromString(instanceId));

            if (instanceData == null) {
                return res.sendStatus(404);
            }

            res.send(instanceData.raw);
        });

        router.post("/services/:instanceId", async (req, res) => {
            const { instanceId } = req.params;
            const bodyServiceInfo = new ServiceInfo(req.body);
            const instanceIdObject = InstanceId.fromString(instanceId);

            if (!instanceIdObject.equals(bodyServiceInfo.value.instanceId)) {
                return res.sendStatus(400);
            }

            const foundInstance = await this.serviceModule.findByInstanceId(instanceIdObject);

            if (foundInstance != null) {
                return res.sendStatus(400);
            }

            const addedInstance = await this.serviceModule.add(bodyServiceInfo);

            if (addedInstance == null) {
                return res.sendStatus(500);
            }

            return res.status(201).send(addedInstance);
        });

        router.put("/services/:instanceId", async (req, res) => {
            const { instanceId } = req.params;
            const bodyServiceInfo = new ServiceInfo(req.body);
            const instanceIdObject = InstanceId.fromString(instanceId);

            if (!instanceIdObject.equals(bodyServiceInfo.value.instanceId)) {
                return res.sendStatus(400);
            }

            const foundInstance = await this.serviceModule.findByInstanceId(instanceIdObject);

            if (foundInstance == null) {
                return res.sendStatus(400);
            }

            const updatedInstance = await this.serviceModule.update(bodyServiceInfo);

            if (updatedInstance == null) {
                return res.sendStatus(500);
            }

            return res.status(200).send(updatedInstance);
        });

        router.delete("/services/:instanceId", async (req, res) => {
            const { instanceId } = req.params;
            const instanceIdObject = InstanceId.fromString(instanceId);

            const foundInstance = await this.serviceModule.findByInstanceId(instanceIdObject);

            if (foundInstance == null) {
                return res.sendStatus(400);
            }

            await this.serviceModule.remove(instanceIdObject);

            return res.sendStatus(200);
        });
    }
}