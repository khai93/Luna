import { IValidatable } from "../interfaces/IValidatable";
import { IValueObject } from "../interfaces/IValueObject";

export class NameNotValid extends Error {
    constructor(message : string) {
        super(message);
        
        this.name = this.constructor.name;
        this.stack = new Error().stack;
    }
}


export class Name implements IValidatable, IValueObject<string> {
    private _value: string;

    constructor(name: string) {
        this._value = name;

        if (!this.isValid()) {
            throw new NameNotValid("Name is not a string or its length is not greather than 0");
        }
    }

    isValid = (): boolean => this._value !== null && 
                             this._value.length > 0
                             
    
    get value(): string {
        return this._value;
    } 

    sameAs(name: Name | string): boolean {
        if (name instanceof Name) {
            return name.value === this._value
        } else {
            const nameObj = new Name(name);

            return nameObj.sameAs(this);
        }
    }
}