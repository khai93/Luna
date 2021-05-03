import { inject, injectable } from "tsyringe";
import { IExecuteable } from "../../common/interfaces/IExecuteable";
import { LoggerModule } from "../logger/types";
import { NginxConfFile } from 'nginx-conf';
import { ServiceModule } from "../service/types";
import shellJS from 'shelljs';
import { ServiceInfo } from "../../common/serviceInfo";
import InstanceId from "../../common/instanceId";
import { Configuration } from "../../config/config";
import fsPromise from 'fs/promises';
import { Name } from "../../common/name";
import { NginxConfigContext, NginxConfigModule } from "../nginx-config/types";

export type NginxInstanceData = {
    serviceName: Name,
    serverBlockLocationIndex: number
}

/**
 * CLEAN UP
 */

@injectable()
export class NginxModule implements IExecuteable {
    private _isServerBlockInsideHttpBlock: boolean | null = null;
    private _serverContext: NginxConfigContext | undefined;

    constructor(
        @inject("LoggerModule") private logger: LoggerModule,
        @inject("ServiceModule") private serviceModule: ServiceModule,
        @inject("ShellJs") private shell: typeof shellJS,
        @inject("ApiGatewayConfig") private apiGatewayConfig: Configuration,
        @inject("FsPromise") private fs: typeof fsPromise,
        @inject("NginxConfigModule") private nginxConfigModule: NginxConfigModule
    ) {}

    async execute(): Promise<void> {
        this.logger.info("Setting up Nginx as the Api Gateway.");

        if (process.platform !== 'linux') {
            this.logger.fatal(new NginxModuleError("The Nginx module only supports linux and may support windows later."));
        }

        if(!this.shell.which('nginx')) {
            this.logger.fatal(new NginxModuleError("'nginx' was not found as a command and is required for nginx module."));
        }

        if (this.apiGatewayConfig.nginx?.confFilePath == null) {
            this.logger.fatal(new NginxModuleError("Environment variable 'NGINX_CONFIG_FILE_PATH' is required to use nginx module."));
        }

        if(this.shell.exec('whoami', { silent: true }).stdout.toLowerCase().trim() !== "root") {
            this.logger.fatal(new NginxModuleError("Root permissions are required to use nginx as the api gateway, Please run luna with 'sudo' or as root."));
        }

  
        this._serverContext = await this.getServerContext();
        
        this.setUpListeners();
    }

    private setUpListeners() {
        this.serviceModule.on('update', (updatedServiceInfo: ServiceInfo) => {
            this.logger.log(`Service [${updatedServiceInfo.value.name.value}] updated.`);
        });

        this.serviceModule.on('remove', (removedInstanceId: InstanceId) => {
            this.logger.log(`Service [${removedInstanceId.raw().serviceName}] deregistered.`);
        });

        this.serviceModule.on('add', async (addedServiceInfo: ServiceInfo) => {
            this.logger.log(`Service [${addedServiceInfo.value.name.value}] registered.`);

            this.appendInstanceToServiceUpstream(addedServiceInfo);
            this.addServiceLocationBlock(addedServiceInfo);
        });


    }

    /**
     * Looks for the first server context, 
     * either inside/outside a http context
     */
    private async getServerContext(): Promise<NginxConfigContext | undefined> {
        if (await this.nginxConfigModule.getRootContext() == null) {
            throw new NginxModuleError("Root context could not be found in the nginx config path.");
        }

        const rootServers = this.nginxConfigModule.getContexts('server');
        
        if (rootServers && rootServers.length > 0) {
            // server context
            return rootServers[0];
        } else {
            const httpContext = this.nginxConfigModule.getContexts('http');
            
            return httpContext && 
                   httpContext.find(context => context.getContexts('server').length > 0)
                   ?.getContexts('server')[0]
        }
    }

    private appendInstanceToServiceUpstream(instance: ServiceInfo) {
        let serviceUpstreamContext = this.nginxConfigModule?.getContexts('upstream')
                                                           ?.find(context => context.value === this.getServiceUpstreamKey(instance));
        
        if (serviceUpstreamContext == null) {
            serviceUpstreamContext = this.nginxConfigModule?.addContext('upstream', this.getServiceUpstreamKey(instance))
                                                         .getContexts('upstream')
                                                         .find(context => context.value === this.getServiceUpstreamKey(instance));
        }                                                   

        if (serviceUpstreamContext?.getComments().length as number < 1) {
            serviceUpstreamContext?.addComment("Managed By Luna");
        }

        const instanceAlreadyAdded = serviceUpstreamContext?.getDirectives('server')
                               ?.some(directive => directive.params[0] === instance.value.url.host);
        
        if (!instanceAlreadyAdded) {
            serviceUpstreamContext?.addDirective({
                name: 'server',
                params: [instance.value.url.host]
            });
        };
    }

    private addServiceLocationBlock(serviceInfo: ServiceInfo): void {
        const serverBlock = this._serverContext;
        const serviceName = serviceInfo.raw().name;

        let serviceLocationContext = serverBlock?.getContexts('location')
                                                 .find(context => context.value === '/' + serviceName);

        if (serviceLocationContext == null) {
            serviceLocationContext = serverBlock?.addContext('location', '/' + serviceName)
                        .getContexts('location')
                        .find(context => context.value === '/' + serviceName);
        };

        if (serviceLocationContext?.getComments().length as number < 1) {
            serviceLocationContext?.addComment("Managed By Luna");
        }

        const serviceLocationDirectiveExists = serviceLocationContext?.getDirectives('proxy_pass')
                                                                      ?.some(directive => directive.params[0] === `http://${this.getServiceUpstreamKey(serviceInfo)}`)

        if (!serviceLocationDirectiveExists) {
            serviceLocationContext?.addDirective({
                name: "proxy_pass", 
                params: [`http://${this.getServiceUpstreamKey(serviceInfo)}`]
            });
        }
    }       

    private getServiceUpstreamKey(serviceInfo: ServiceInfo): string {
        return `luna_service_${serviceInfo.raw().name}`;
    }
}

export class NginxModuleError extends Error {
    constructor(message : string) {
        super(message);
        
        this.name = this.constructor.name;
        this.stack = new Error().stack;
    }
}