import dotenv from 'dotenv';
import { LoadBalancerType } from 'src/components/balancer/types';

dotenv.config({ path: `.env.${process.env.NODE_ENV?.toLowerCase() || 'development'}` });

export const config = {
    server: {
        port: parseInt(getEnvironmentVariable("LUNA_PORT", false, "80") as string)
    },
    balancer: LoadBalancerType[getEnvironmentVariable("LOAD_BALANCER_TYPE", false, "RoundRobin") as keyof typeof LoadBalancerType]
}

export function getEnvironmentVariable(varName: string, required?: boolean, defaultValue?: string)  {
    if (varName in process.env) {
        return process.env[varName];
    } else if (required) {
        throw new Error(`${varName} is a required env variable and was not found!`);
    } else {
        if (defaultValue !== null) {
            return defaultValue;
        }

        throw new Error(`${varName} is a optional env variable and a default value for it was not found!`)
    }
}