export interface LoggerModule {
    info(message: string): void;
    log(message: string): void;
    warn(message: string): void;
    error(error: Error): void;
    fatal(error: Error): void;
    debug(message: string): void;
}