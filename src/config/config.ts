export type Configuration = {
    server: {
        port: number
    }
}

export const config: Configuration = {
    server: {
        port: (process.env.PORT && parseInt(process.env.PORT)) || 8080
    }
}