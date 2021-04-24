import { Router } from "express";
import { injectable } from "tsyringe";
import Version from "../../common/version";

export interface ServiceRegistryRoute {
    version: Version
    execute(router: Router): void;
}