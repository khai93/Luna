import { RequestHandler } from "express";

export class Middleware {
    private _value: RequestHandler;

    constructor(handler: RequestHandler) {
        this._value = handler;
    }

    get value(): RequestHandler {
        return this._value;
    }
}