import { NginxConfFile } from "nginx-conf";
import { NginxConfItem } from "nginx-conf/dist/src/conf";
import EventEmitter from "node:events";
import TypedEmitter from "typed-emitter"
import { inject, injectable } from "tsyringe";
import { NginxConfigContext, NginxConfigDirective, NginxConfigModule, NginxConfigModuleError, NginxConfigContextEvents } from "./types";

export class NginxConfModuleContext extends (EventEmitter as new () => TypedEmitter<NginxConfigContextEvents>) implements NginxConfigContext {
    private _context: NginxConfItem;
    readonly name: string;
    readonly value: string | number;
    
    constructor(context: NginxConfItem) {
        super();
        this.name = context._name;
        this.value = context._value;
        this._context = context;
    }

    getContexts(name: string): NginxConfigContext[] {
        const foundContexts = this._context[name];

        if (foundContexts != null) {
            return foundContexts.map(context => new NginxConfModuleContext(context));
        }

        return [];
    }

    addContext(name: string, value: string): NginxConfigContext {
        const updateContext =  new NginxConfModuleContext(this._context._add(name, value));

        this.emit('update', updateContext);

        return updateContext;
    }

    addComment(comment: string): NginxConfigContext {
       this._context._comments.push(comment);

       this.emit('update', this);

       return this;
    }

    getComments(): string[] {
        return this._context._comments;
    }

    addDirective(directive: NginxConfigDirective): NginxConfigContext {
        const addContext = new NginxConfModuleContext(this._context._add(directive.name, directive.params.join(" ")));

        this.emit('update', addContext);

        return addContext;
    }

    getDirectives(name: string): NginxConfigDirective[] | undefined {
        const foundDirective = this._context[name];

        if (foundDirective) {
            return foundDirective.map(directive => 
                ({name: directive._name, params: (typeof(directive) == 'number' && [directive]) || 
                (directive._value as string).split(" ")} as NginxConfigDirective)
            )
        }

        return undefined;
    }
}

@injectable()
export class NginxConfModule implements NginxConfigModule {
    private _rootContext: NginxConfigContext | undefined;

    constructor(
        @inject("NginxConf") private nginxConf: typeof NginxConfFile,
        @inject("PathToNginxConfigFile") private nginxConfigFilePath: string
    ) {
        /**
         * Sets root context
         */
        this.getRootContext();
    }

    getRootContext(): Promise<NginxConfigContext> {
        return new Promise((resolve, reject) => {
            this.nginxConf.create(this.nginxConfigFilePath, (err, conf) => {
                if (err || !conf) {
                    throw (err || new NginxConfigModuleError(`Could not set up NgixConf at file path '${this.nginxConfigFilePath}'`));
                }
    
                this._rootContext = new NginxConfModuleContext(conf.nginx);
                
                const flushConf = async () => await this.flush(conf);

                this._rootContext.on('update', async (updateContext: NginxConfigContext) => {
                    // Listen to updated context's update to apply their updates
                    updateContext.on('update', flushConf);
                    await flushConf();
                }); 

                return resolve(this._rootContext);
            });
        });
    }

    getContexts(name: string, parentContext?: NginxConfigContext): NginxConfigContext[] | undefined {
        if (parentContext != null) {
            return parentContext.getContexts(name);
        }

        return this._rootContext?.getContexts(name);
    }

    addContext(name: string, value: string, parentContext?: NginxConfigContext): NginxConfigContext {
        if (parentContext != null) {
            return parentContext.addContext(name, value);
        }

        const addedContext =  this._rootContext?.addContext(name, value);
        
        if (addedContext) {
            return addedContext;
        }

        throw new NginxConfigModuleError(`Could not add context '${name}'`);
    }

    private flush(conf: NginxConfFile): Promise<void> {
        return new Promise(async (resolve, reject) => {
            conf.flush((err) => {
                if (err) throw err;

                return resolve();
            })
        })
    }
}

