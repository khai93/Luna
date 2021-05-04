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
import { LoadBalancerModule } from "../load-balancer/types";
export type NginxInstanceData = {
    serviceName: Name,
    serverBlockLocationIndex: number
}

/**
 * CLEAN UP
 */

@injectable()
export class NginxModule implements IExecuteable {
    private _reloading = false;

    constructor(
        @inject("LoggerModule") private logger: LoggerModule,
        @inject("ServiceModule") private serviceModule: ServiceModule,
        @inject("ShellJs") private shell: typeof shellJS,
        @inject("ApiGatewayConfig") private apiGatewayConfig: Configuration,
        @inject("LoadBalancerModule") private loadBalancerModule: LoadBalancerModule
    ) {
        this.logger.log("Nginx Gateway Selected as Gateway.");
    }

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

        this.setUpListeners();
    }

    private setUpListeners() {
        this.serviceModule.on('update', (updatedServiceInfo: ServiceInfo) => {
            this.logger.log(`Service [${updatedServiceInfo.value.name.value}] updated.`);
        });

        this.serviceModule.on('remove', (removedInstanceId: InstanceId) => {
            this.logger.log(`Service [${removedInstanceId.raw().serviceName}] deregistered.`);
        });

        this.serviceModule.on('add', (addedInstance: ServiceInfo) => {
            this.logger.log(`Service [${addedInstance.value.name.value}] registered.`);
            this.loadBalancerModule.balanceService(addedInstance);
            this.requestNginxReload();
        });
    }

    private requestNginxReload() {
        if (this._reloading === false) {
            this._reloading = true;
            this.logger.info('Reloading Nginx service in 3 seconds.');

            setTimeout(() => {
                if (this.shell.exec('sudo nginx -t', { silent: true }).code != 0) {
                    this.logger.error(new NginxModuleError("Nginx Config File Test: Failure"));
                } else {
                    this.logger.info("Nginx Config File Test: Success");
                }

                if (this.shell.exec('sudo service nginx reload', { silent: true }).code != 0) {
                    this.logger.error(new NginxModuleError("Nginx Service Reload: Failure"));
                } else {
                    this.logger.info("Nginx Service Reload: Success");
                }

                this._reloading = false;
            }, 3000);
        }
    }
}

export class NginxModuleError extends Error {
    constructor(message : string) {
        super(message);
        
        this.name = this.constructor.name;
        this.stack = new Error().stack;
    }
}