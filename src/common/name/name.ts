export class NameNotValid extends Error {
    constructor(message : string) {
        super(message);
        
        this.name = this.constructor.name;
        this.stack = new Error().stack;
    }
}


export class Name {
    private _value: string;

    constructor(name: string) {
        this._value = name;

        if (!this.isValid()) {
            throw new NameNotValid("Name's length is not greather than 0");
        }
    }

    isValid = (): boolean => this._value !== null && this._value.length > 0;
    get value(): string {
        return this._value;
    } 
}