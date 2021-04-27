import { Name } from '../name';
import { IValidatable } from '../interfaces/IValidatable';
import { IValueObject } from '../interfaces/IValueObject';
import { IEquatable } from '../interfaces/IEquatable';

export type ServiceInfoValue = {
    name: Name,
    description: string,
    version: string,
    https: boolean,
    host: string,
    port: number,
    last_heartbeat: Date,
    online: boolean
}

export type ServiceInfoRaw = {
    name: string,
    description: string,
    version: string,
    https: boolean,
    host: string,
    port: number,
    last_heartbeat: number,
    online: boolean
}

export class ServiceInfo implements IValidatable, IValueObject<ServiceInfoValue>, IEquatable<ServiceInfo> {
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
            last_heartbeat: new Date(Date.now()),
            online: obj.online
        };

        if (!this.isValid) {
            throw new ServiceInfoNotValidError("Invalid Service");
        }
    }
   
    isValid = (): boolean => Object.values(this._value).every(val => typeof(val) === "string" ? val && val.length > 0 : true);

    equals(object: ServiceInfo): boolean {
        // Comparing names because names should be unique between services
        return object.value.name.value === this._value.name.value;
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
            last_heartbeat: this._value.last_heartbeat.getTime(),
            online: this._value.online
        } as ServiceInfoRaw;
    }

    get value(): ServiceInfoValue {
        return this._value;
    }
}

export class ServiceInfoNotValidError extends Error {
    constructor(message : string) {
        super(message);

        this.name = this.constructor.name;
        this.stack = new Error().stack;
    }
}