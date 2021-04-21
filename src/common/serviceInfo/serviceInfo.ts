class ServiceInfoNotValid extends Error {
    constructor(message : string) {
        super(message);

        this.name = this.constructor.name;
        this.stack = new Error().stack;
    }
}

export type ServiceInfoValue = {
    name: string,
    description: string,
    version: string,
    host: string,
    port: number
}

export class ServiceInfo {
    private _value: ServiceInfoValue;

    constructor(info: string | ServiceInfoValue) {
        if (typeof(info) === 'string') {
            this._value = JSON.parse(info);
        } else {
            this._value = info;
        }

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
        return comparedServiceInfo.value.name === this._value.name;
    }

    get value(): ServiceInfoValue {
        return this._value;
    }
}