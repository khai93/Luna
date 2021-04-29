import { inject, injectable } from "tsyringe";
import { IExecuteable } from "../../common/interfaces/IExecuteable";
import { LoggerModule } from "../logger/types";
import { NginxConfFile } from 'nginx-conf';
import { ServiceModule } from "../service/types";
import shellJS from 'shelljs';
import { ServiceInfo } from "../../common/serviceInfo";
import InstanceId from "../../common/instanceId";

@injectable()
export class NginxModule implements IExecuteable {

    constructor(
        @inject("LoggerModule") private logger: LoggerModule,
        @inject("NginxConf") private nginxConf: NginxConfFile,
        @inject("ServiceModule") private serviceModule: ServiceModule,
        @inject("ShellJs") private shell: typeof shellJS
    ) { }

    execute(): void {
        this.logger.info("Setting up Nginx as the Api Gateway.");

        if (process.platform !== 'linux') {
            this.logger.fatal(new NginxModuleError("The Nginx module only supports linux and may support windows later."));
            process.exit(1);
        }

        if(!this.shell.which('nginx')) {
            this.logger.fatal(new NginxModuleError("'nginx' was not found as a command and is required for nginx module."));
            process.exit(1);
        }

        if(this.shell.exec('whoami').stdout.toLowerCase().trim() !== "root") {
            this.logger.fatal(new NginxModuleError("Root permissions are required to use nginx as the api gateway, Please run luna with 'sudo' or as root."));
            process.exit(1);
        }

        this.setUpListeners();
    }

    private setUpListeners() {
        this.serviceModule.on('update', (updatedServiceInfo: ServiceInfo) => {

        });

        this.serviceModule.on('remove', (removedInstanceId: InstanceId) => {
            
        });

        this.serviceModule.on('add', (addedServiceInfo: ServiceInfo) => {

        });
    }
}

export class NginxModuleError extends Error {
    constructor(message : string) {
        super(message);
        
        this.name = this.constructor.name;
        this.stack = new Error().stack;
    }
}