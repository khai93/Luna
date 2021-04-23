import { LoggerModule } from "./types";

export class NodeModule implements LoggerModule {
    log(message: string): void {
        console.log(message);
    }
    warn(message: string): void {
        console.warn(message);
    }
    error(error: Error): void {
        console.error(error);
    }
}