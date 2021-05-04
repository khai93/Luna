import { LoadBalancerType, LoadBalancerTypeListItem } from "../types";
import { NoneModule } from "./noneModule";
import { RoundRobinModule } from "./roundRobinModule";
import { WeightedRoundRobinModule } from "./weightedRoundRobinModule";

const LunaModules: LoadBalancerTypeListItem[] = [
    {
        type: LoadBalancerType.RoundRobin,
        module: RoundRobinModule
    },
    {
        type: LoadBalancerType.WeightedRoundRobin,
        module: WeightedRoundRobinModule
    },
    {
        type: LoadBalancerType.Default,
        module: NoneModule
    }
]

export default LunaModules;