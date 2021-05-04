import { ApiGatewayProxy } from "./luna/api-gateway/proxy";
import { ApiGatewayServer } from "./luna/api-gateway/server";
import { IExecuteable } from "../../common/interfaces/IExecuteable";
import { container } from "../../di";

export class LunaModule implements IExecuteable {
    execute(): void {
        const gatewayServerInstance = container.resolve(ApiGatewayServer);
        gatewayServerInstance.start();

        container.resolve(ApiGatewayProxy);
    }
}