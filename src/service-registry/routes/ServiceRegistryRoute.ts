import { Router } from "express";
import { injectable } from "tsyringe";

export interface ServiceRegistryRoute {
    execute(router: Router): void
}