import { WeightedRoundRobinModule } from "./weightedRoundRobinModule";
import { LoadBalancerType, LoadBalancerTypeListItem } from "../types";
import { RoundRobinModule } from './roundRobinModule';

const NginxModules: LoadBalancerTypeListItem[] = [
    { 
        type: LoadBalancerType.RoundRobin,
        module: RoundRobinModule
    },
    {
        type: LoadBalancerType.Default,
        module: RoundRobinModule
    },
    {
        type: LoadBalancerType.WeightedRoundRobin,
        module: WeightedRoundRobinModule
    }
]

export default NginxModules;