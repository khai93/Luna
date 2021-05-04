import lunaBalancerModules from './luna';
import nginxbalancerModules from './nginx';
import { LoadBalancerModule, LoadBalancerType,  LoadBalancerTypeListItem} from './types';

import { ApiGatewayType } from '../../config/config';

export type ApiGatewayLoadBalancerSubModules = {
    gateway: ApiGatewayType,
    balancerModules: LoadBalancerTypeListItem[]
}

const modules: ApiGatewayLoadBalancerSubModules[] = [
    {
        gateway: ApiGatewayType.Luna,
        balancerModules: lunaBalancerModules
    },
    {
        gateway: ApiGatewayType.Nginx,
        balancerModules: nginxbalancerModules
    }
]


export default modules;