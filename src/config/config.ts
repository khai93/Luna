import dotenv from 'dotenv';

dotenv.config({ path: `.env.${process.env.NODE_ENV?.toLowerCase() || 'development'}` });

export type Configuration = {
    server: {
        port: number,
        auth?: {
            username: string,
            password: string
        }
    },
}

export const apiGatewayConfig: Configuration = {
    server: {
        port: parseInt(getEnvironmentVariable("API_GATEWAY_PORT", false, "8080") as string)
    }
}

export const serviceRegistryConfig: Configuration = {
    server: {
        port: parseInt(getEnvironmentVariable("SERVICE_REGISTRY_PORT", false, "3000") as string),
        auth: {
            username: getEnvironmentVariable("SERVICE_REGISTRY_AUTH_USERNAME", false, "") as string,
            password: getEnvironmentVariable("SERVICE_REGISTRY_AUTH_PASSWORD", false, "") as string,
        }
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