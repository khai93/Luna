import { inject, injectable } from "tsyringe";
import { LoggerModule } from "./types";
import { Logger } from "tslog";
import { TOKENS } from "src/di";

@injectable()
export class TSLoggerModule implements LoggerModule {
    constructor(@inject(TOKENS.values.tsLogger) private logger: Logger) {}
    
    log(message: string): void {
        this.logger.info(message);
    }
    warn(message: string): void {
        this.logger.warn(message);
    }
    error(error: Error): void {
        this.logger.prettyError(error);
    }
    fatal(error: Error): void {
        this.logger.fatal(error);
    }
}