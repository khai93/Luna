import { Router } from "express";
import Version from "../../../common/version";

export interface ExpressRegistryRoute {
    version: Version;
    execute(router: Router): void;
}