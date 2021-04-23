import glob from 'glob';
import fs from 'fs/promises';
import { Name } from '../name';
class ServiceInfoNotValid extends Error {
    constructor(message : string) {
        super(message);

        this.name = this.constructor.name;
        this.stack = new Error().stack;
    }
}

export type ServiceInfoValue = {
    name: Name,
    description: string,
    version: string,
    https: boolean,
    host: string,
    port: number,
    online: boolean
}

export type ServiceInfoRaw = {
    name: string,
    description: string,
    version: string,
    https: boolean,
    host: string,
    port: number,
    online: boolean
}

export class ServiceInfo {
    private _value: ServiceInfoValue;

    constructor(info: string | ServiceInfoValue) {
        let obj;

        if (typeof(info) === 'string') {
            obj = JSON.parse(info) as unknown as ServiceInfoRaw;
        } else {
            obj = info as unknown as ServiceInfoRaw;
        }

        this._value = {
            name: new Name(obj.name),
            description: obj.description,
            version: obj.version,
            https: obj.https,
            host: obj.host,
            port: obj.port,
            online: obj.online
        };

        if (!this.isValid) {
            throw new ServiceInfoNotValid("Invalid Service");
        }
    }

    isValid = (): boolean => Object.values(this._value).every(val => typeof(val) === "string" ? val && val.length > 0 : true);

    /**
     * Compares a ServiceInfoValue to the current value to see if they are the same
     * @param comparedServiceInfo the service info to compare to
     * @returns boolean
     */
    sameAs(comparedServiceInfo: ServiceInfo): boolean {
        // Comparing names because names should be unique between services
        return comparedServiceInfo.value.name.value === this._value.name.value;
    }

    get value(): ServiceInfoValue {
        return this._value;
    }
}