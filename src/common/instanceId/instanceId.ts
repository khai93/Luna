
import Hostname from "../hostname";
import { IEquatable } from "../interfaces/IEquatable";
import { IValidatable } from "../interfaces/IValidatable";
import { IValueObject } from "../interfaces/IValueObject";
import { Name } from "../name";
import Port from "../port";

export type InstanceIdValue = {
    serviceName: Name,
    hostname: Hostname,
    port: Port
}

export type InstanceIdRaw = {
    serviceName: string,
    hostname: string,
    port: number
}

export class InstanceId implements IValidatable, IValueObject<InstanceIdValue>, IEquatable<InstanceId | string> {
    readonly value: InstanceIdValue;
    
    constructor(_instanceIdRaw: InstanceIdRaw) {
        this.value = {
            serviceName: new Name(_instanceIdRaw.serviceName),
            hostname: new Hostname(_instanceIdRaw.hostname),
            port: new Port(_instanceIdRaw.port)
        }

        if (!this.isValid()) {
            throw new InstanceIdNotValidError("String is not a valid instance id");
        }
    }

    isValid = (): boolean => this.value !== null &&
                             this.value.hostname.isValid() &&
                             this.value.port !== null &&
                             this.value.serviceName.isValid(); 

    equals(object: InstanceId): boolean {
        return object.value.hostname.equals(this.value.hostname) &&
               object.value.serviceName.equals(this.value.serviceName) &&
               object.value.port.equals(this.value.port);
    }

    raw(): InstanceIdRaw {
        return {
            serviceName: this.value.serviceName.value,
            hostname: this.value.hostname.value,
            port: this.value.port.value
        };
    }

    static parseInstanceIdString(instanceIdString: string): InstanceIdRaw {
        const instanceIdRegex = /(\w+):(.*):(\d+)/g;

        const matches = instanceIdString.match(instanceIdRegex);

        console.log(matches);

        if (matches !== null && matches.length === 3) {
            return {
                serviceName: matches[0],
                hostname: matches[1],
                port: parseInt(matches[2])
            }
        }

        throw new ParseInstanceIdStringError("String is not a valid instance id format.");
    }
}

export class ParseInstanceIdStringError extends Error {
    constructor(message : string) {
        super(message);

        this.name = this.constructor.name;
        this.stack = new Error().stack;
    }
}

export class InstanceIdNotValidError extends Error {
    constructor(message : string) {
        super(message);

        this.name = this.constructor.name;
        this.stack = new Error().stack;
    }
}