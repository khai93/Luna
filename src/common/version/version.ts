import { IEquatable } from "../interfaces/IEqualityComparer";
import { IValidatable } from "../interfaces/IValidatable";
import { IValueObject } from "../interfaces/IValueObject";

class VersionNotValid extends Error {
    constructor(message : string) {
        super(message);

        this.name = this.constructor.name;
        this.stack = new Error().stack;
    }
}

export class Version implements IValidatable, IValueObject<number>, IEquatable<Version | number> {
    private _value: number;

    constructor(version: number) {
        this._value = version;

        if (!this.isValid) {
            throw new VersionNotValid("Version number provided is not a postive integer.");
        }
    }
 

    isValid = (): boolean => this._value !== null && this._value > 0 && Number.isInteger(this._value);

    get value(): number {
        return this._value
    }

    equals(object: number | Version): boolean {
        if (object instanceof Version) {
            return this._value === object.value;
        } else  {
            const versionObj = new Version(object);

            return versionObj.equals(this);
        }
    }
}