import glob from 'glob';
import fs from 'fs/promises';
import { Name } from '../name';
import { IValidatable } from '../interfaces/IValidatable';
import { IValueObject } from '../interfaces/IValueObject';
export class ServiceInfoNotValid extends Error {
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

export class ServiceInfo implements IValidatable, IValueObject<ServiceInfoValue> {
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

    /**
     * @returns An object that is type ServiceInfoValue with its values all being primitive types
     */
    raw() {
        return {
            name: this._value.name.value,
            description: this._value.description,
            version: this._value.version,
            https: this._value.https,
            host: this._value.host,
            port: this._value.port,
            online: this._value.online
        } as ServiceInfoRaw;
    }

    get value(): ServiceInfoValue {
        return this._value;
    }
}