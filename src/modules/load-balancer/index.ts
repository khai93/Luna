import { RoundRobinModule } from './roundRobinModule';
import { LoadBalancerModule } from './types';

export enum LoadBalancerType {
    RoundRobin
}

export type LoadBalancerTypeListItem = {
    type: LoadBalancerType,
    module: any
}

const modules: LoadBalancerTypeListItem[] = [
    {
        type: LoadBalancerType.RoundRobin,
        module: RoundRobinModule
    }
]

export default modules;