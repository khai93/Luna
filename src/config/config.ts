import dotenv from 'dotenv';

dotenv.config({ path: `.env.${process.env.NODE_ENV?.toLowerCase() || 'development'}` });

export const config = {
    registry: {
        port: parseInt(getEnvironmentVariable("REGISTRY_PORT", false, "3000") as string)
    }
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