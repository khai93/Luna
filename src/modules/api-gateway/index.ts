import { ApiGatewayType } from '../../config/config';
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
]

export default modules;