import { LoggerModule } from "./types";

export class NodeModule implements LoggerModule {
    debug(message: string): void {
        console.debug(message);
    }

    info(message: string): void {
        console.log(message);
    }

    log(message: string): void {
        console.log(message);
    }

    warn(message: string): void {
        console.warn(message);
    }

    error(error: Error): void {
        console.error(error.name + ": " + error.message + "\nstack: " + error.stack);
    }
    
    fatal(error: Error): void {
        console.error(error);
    }
}