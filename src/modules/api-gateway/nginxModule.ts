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

export type NginxInstanceData = {
    serviceName: Name,
    serverBlockLocationIndex: number
}

@injectable()
export class NginxModule implements IExecuteable {
    private _isServerBlockInsideHttpBlock: boolean | null = null;
    private _instances: NginxInstanceData[] = [];
    private _conf: NginxConfFile | undefined;
    private _servicesAddingAmount = 0;

    constructor(
        @inject("LoggerModule") private logger: LoggerModule,
        @inject("NginxConf") private nginxConf: NginxConfFile,
        @inject("ServiceModule") private serviceModule: ServiceModule,
        @inject("ShellJs") private shell: typeof shellJS,
        @inject("ApiGatewayConfig") private apiGatewayConfig: Configuration,
        @inject("FsPromise") private fs: typeof fsPromise
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

        this._conf = await this.getConfFile();
        this.flushTimer();
        this._isServerBlockInsideHttpBlock = await this.validateServerBlockLocation() as boolean;
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

            await this.appendInstanceToServiceUpstream(addedServiceInfo);
            
            const serviceData = this._instances.find(instance => instance.serviceName.equals(addedServiceInfo.value.name));
            
            if (serviceData == null) {
                await this.addServiceLocationBlock(addedServiceInfo);
            }
        });

        process.on("beforeExit", () => {
            this.flushConfFile();
        });
    }

    private flushTimer() {
        setInterval(() => {
            this.flushConfFile();
        }, 2000);
    }

    private flushConfFile() {
        this._conf?.flush(async (errs) => {
            if (errs) errs.map(this.logger.error);
            this.logger.info("Flushed Config File");
            this._conf = await this.getConfFile();
        });
    }

    /**
     * Returns the NginxConfFile from nginx-conf npm package
     * 
     * IMPORTANT: REMEMBER TO FLUSH THE RETURNED CONF STREAM
     * 
     * @returns NginxConfFile
     */
    private async getConfFile(): Promise<NginxConfFile> {
        return new Promise((resolve, reject) => {
            const configFilePath = this.apiGatewayConfig.nginx?.confFilePath as string;

            this.fs.open(configFilePath, 'r')
                .then(() => {
                    NginxConfFile.create(configFilePath, (err, conf) => {
                        if (err || !conf) {
                            this.logger.fatal(err as Error);
                        }
                        
                        return resolve(conf as NginxConfFile);
                    });
                })
                .catch(e => {
                    // file does not exist
                    if ((e.code && e.code === 'ENOENT') && (e.errno && e.errno === -2)) {

                        this.logger.fatal(e);
                        process.exit(1);
                    }
                })
        });
    }

    /**
     * Validates the conf file provided in the env variable 'NGINX_CONFIG_FILE_PATH'
     * Mainly looking for the server block
     * @returns boolean server block is inside a http block
     * 
     */
    private async validateServerBlockLocation(): Promise<boolean | void> {
        if (this._conf?.nginx.http) {
            if(!this._conf?.nginx.http.some(httpBlock => httpBlock.server != null)) {
                this.logger.fatal(new NginxModuleError(`Could not find a server block in a http block in '${this.apiGatewayConfig.nginx?.confFilePath}'`));
            }
        } else if (this._conf?.nginx.server != null) {
            this._conf?.flush((errs) => {
                if (errs) errs.map(this.logger.error);
                return Promise.resolve(true);
            });
        } else {
            this._conf?.flush((errs) => {
                if (errs) errs.map(this.logger.error);
                this.logger.fatal(new NginxModuleError(`Could not find a server block in '${this.apiGatewayConfig.nginx?.confFilePath}'`));
                return Promise.reject();
            });
        }
    }

    private async appendInstanceToServiceUpstream(instance: ServiceInfo): Promise<void> {
        const serviceUpstreamExists = this._conf?.nginx?.upstream?.some(block => block._value === this.getServiceUpstreamKey(instance));
        
        // create upstream if it does not exist for the instance's service
        if (!serviceUpstreamExists) {
            const added = this._conf?.nginx._add('upstream', this.getServiceUpstreamKey(instance));
        }

        const serviceUpstreamBlock = this._conf?.nginx?.upstream?.find(block => block._value === this.getServiceUpstreamKey(instance));

        if (serviceUpstreamBlock?._comments.length as number <= 1) {
            serviceUpstreamBlock?._comments.push(" == Managed by Luna == ");
            serviceUpstreamBlock?._comments.push(" DO NOT CHANGE THESE VALUES ");
        }

        if (serviceUpstreamBlock != null) {
            if (!serviceUpstreamBlock.server?.find(block => block._value === instance.value.url.host)) {
                serviceUpstreamBlock._add('server', instance.value.url.host);
            }
        } else {
            this.logger.warn("Could not find insance's service upstream block while attempting to append.");
        }
        
        return Promise.resolve();
    }

    private async addServiceLocationBlock(serviceInfo: ServiceInfo): Promise<void> {
        const serverBlock = this._isServerBlockInsideHttpBlock ?
                            this._conf?.nginx.http?.find(httpBlock => httpBlock.server != null) :
                            this._conf?.nginx.server && this._conf?.nginx.server[0]
        

        const serviceLocationExists = serverBlock?.location?.some(block => block._value === "/" + serviceInfo.raw().name);

        if (!serviceLocationExists) {
            serverBlock?._add('location', '/' + serviceInfo.raw().name);
            const serverBlockIndex = (serverBlock?.location?.length as number) - 1;

            const block = serverBlock?.location?.find(block => block._value === "/" + serviceInfo.raw().name);

            if (block?._comments.length as number <= 1) {
                block?._comments.push(" == Managed by Luna == ");
                block?._comments.push(" DO NOT CHANGE THESE VALUES ");
            }

            block?._add('proxy_pass', `http://${this.getServiceUpstreamKey(serviceInfo)}`);
        
            this._instances.push({
                serviceName: serviceInfo.value.name,
                serverBlockLocationIndex: serverBlockIndex || 0
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