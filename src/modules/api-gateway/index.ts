import { ApiGatewayType } from '../../config/config';
import { LunaModule } from './lunaModule';
import { NginxModule } from './nginxModule';

export type ApiGatewayTypeListItem = {
    type: ApiGatewayType,
    module: any
}

const modules: ApiGatewayTypeListItem[] = [
    {
        type: ApiGatewayType.Nginx,
        module: NginxModule
    },
    {
        type: ApiGatewayType.Luna,
        module: LunaModule
    }
]

export default modules;