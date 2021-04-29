import { Name } from '../name';
import { IValidatable } from '../interfaces/IValidatable';
import { IValueObject } from '../interfaces/IValueObject';
import { IEquatable } from '../interfaces/IEquatable';
import InstanceId from '../instanceId';
import { InstanceIdRaw } from '../instanceId/instanceId';
import Hostname from '../hostname';
import Port from '../port';
import Version from '../version';
import { Status, StatusText } from '../status/status';
import { BalancerOptions, BalancerOptionsValue } from '../balancerOptions/balancerOptions';

export type ServiceInfoValue = {
    instanceId: InstanceId,
    name: Name,
    description: string,
    version: Version,
    url: URL,
    balancerOptions: BalancerOptions,
    status: Status,
    last_heartbeat: Date,
}

export type ServiceInfoRaw = {
    instanceId: InstanceIdRaw,
    name: string,
    description: string,
    version: number,
    status: string,
    balancerOptions: BalancerOptionsValue,
    url: string,
    last_heartbeat: number,
}

export class ServiceInfo implements IValidatable, IValueObject<ServiceInfoValue>, IEquatable<ServiceInfo> {
    private _value: ServiceInfoValue;

    constructor(info: string | ServiceInfoRaw) {
        let obj: ServiceInfoRaw;

        if (typeof(info) === 'string') {
            obj = JSON.parse(info) as unknown as ServiceInfoRaw;
        } else {
            obj = info;
        }

        if (typeof(obj.instanceId) === 'string') {
            obj.instanceId = InstanceId.fromString(obj.instanceId).raw();
        }

        this._value = {
            instanceId: new InstanceId(obj.instanceId),
            name: new Name(obj.name),
            description: obj.description,
            version: new Version(obj.version),
            status: new Status(obj.status),
            balancerOptions: new BalancerOptions(obj.balancerOptions),
            url: new URL(obj.url),
            last_heartbeat: new Date(Date.now()),
        };

        if (!this.isValid) {
            throw new ServiceInfoNotValidError("Invalid Service");
        }
    }
   
    isValid = (): boolean => Object.values(this._value).every(val => typeof(val) === "string" ? val && val.length > 0 : true);

    equals(object: ServiceInfo): boolean {
        // Comparing instance ids because instance ids should be unique between services
        return object.value.instanceId.equals(this._value.instanceId);
    }

    /**
     * @returns An object that is type ServiceInfoValue with its values all being primitive types
     */
    raw() {
        return {
            instanceId: this._value.instanceId.raw(),
            name: this._value.name.value,
            description: this._value.description,
            version: this._value.version.value,
            url: this._value.url.toString(),
            status: StatusText[this._value.status.value],
            balancerOptions: this._value.balancerOptions.value,
            last_heartbeat: this._value.last_heartbeat.getTime()
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