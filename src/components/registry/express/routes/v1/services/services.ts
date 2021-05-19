import { Router } from "express";
import Version from "../../../../../../common/version";
import { ExpressRegistryRoute } from "../../../ExpressRegistryRoute";

export class ExpressRegistryServicesRoute implements ExpressRegistryRoute {
    version: Version = new Version("1");

    execute(router: Router){
        throw new Error("Not Implemented")
    }
}