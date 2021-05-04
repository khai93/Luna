import { inject, injectable } from "tsyringe";
import { apiGatewayConfig, Configuration } from "../../config/config";
import { LoadBalancerType } from "../../modules/load-balancer/types";
import { IValidatable } from "../interfaces/IValidatable";
import { IValueObject } from "../interfaces/IValueObject";



export type BalancerOptionsValue = {
    weight?: number
}

export class BalancerOptions implements IValidatable, IValueObject<BalancerOptionsValue> {
    readonly value: BalancerOptionsValue;
    private _errorMessage: string = "";

    constructor(
        opts: BalancerOptionsValue
    ) {
        this.value = opts;

        if (!this.isValid()) {
            throw new BalancerOptionsNotValidError(this._errorMessage);
        }

    }

    isValid(): boolean {
        if (this.value == null || this.value.weight == null && apiGatewayConfig.balancer === LoadBalancerType.WeightedRoundRobin) {
            this._errorMessage = "'weight' is required in balancerOptions when using Weighted Round Robin balancer.";
            return false;
        }

        return true;
    }
}

export class BalancerOptionsNotValidError extends Error {
    constructor(message : string) {
        super(message);

        this.name = this.constructor.name;
        this.stack = new Error().stack;
    }
}