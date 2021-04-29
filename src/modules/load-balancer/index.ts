import { NoneModule } from './noneModule';
import { RoundRobinModule } from './roundRobinModule';
import { LoadBalancerModule } from './types';
import { WeightedRoundRobinModule } from './weightedRoundRobinModule';

export enum LoadBalancerType {
    RoundRobin,
    WeightedRoundRobin,
    None
}

export type LoadBalancerTypeListItem = {
    type: LoadBalancerType,
    module: any
}

const modules: LoadBalancerTypeListItem[] = [
    {
        type: LoadBalancerType.RoundRobin,
        module: RoundRobinModule
    },
    {
        type: LoadBalancerType.WeightedRoundRobin,
        module: WeightedRoundRobinModule
    },
    {
        type: LoadBalancerType.None,
        module: NoneModule
    }
]

export default modules;