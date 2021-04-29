import { Logger } from "tslog";
import { inject, injectable } from "tsyringe";
import { LoggerModule } from "./types";

@injectable()
export class tslogModule implements LoggerModule {
    constructor(
        @inject("TslogLogger") private logger: Logger
    ) { }

    debug(message: string): void {
        this.logger.debug(message);
    }

    info(message: string): void {
        this.logger.info(message);
    }

    fatal(error: Error): void {
        this.logger.fatal(error);
    }

    log(message: string): void {
        this.logger.info(message);
    }

    warn(message: string): void {
        this.logger.warn(message);
    }

    error(error: Error): void {
        this.logger.error(error.message);
    }
}