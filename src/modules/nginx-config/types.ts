import EventEmitter from "node:events";
import { ServiceInfo } from "../../common/serviceInfo";

export type NginxConfigDirective = {
    name: string,
    params: string[]
}

export interface NginxConfigContext extends EventEmitter {
    readonly name: string;
    readonly value: string | number;

    getContexts(name: string): NginxConfigContext[];
    addContext(name: string, value: string): NginxConfigContext;
    addComment(comment: string): NginxConfigContext;
    getComments(): string[];
    addDirective(directive: NginxConfigDirective): NginxConfigContext;
    getDirectives(name: string): NginxConfigDirective[] | undefined;
}   

export interface NginxConfigModule {
    getRootContext(): Promise<NginxConfigContext>;
    getContexts(name: string, parentContext?: NginxConfigContext): NginxConfigContext[] | undefined;
    addContext(name: string, value: string, parentContext?: NginxConfigContext): NginxConfigContext;
}

export interface NginxConfigContextEvents {
    error: (error: Error) => void,
    update: (updatedContext: NginxConfigContext) => void
}


export class NginxConfigModuleError extends Error {
    constructor(message : string) {
        super(message);
        
        this.name = this.constructor.name;
        this.stack = new Error().stack;
    }
}