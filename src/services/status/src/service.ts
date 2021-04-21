import express from 'express';
import fs from 'fs/promises';
import fsSync from 'fs';
import http from 'http';
import { AddressInfo } from 'node:net';

const serviceConfig = JSON.parse(fsSync.readFileSync("service.json", "utf8"));

const app = express();
const host = process.env.HOST || '127.0.0.1';
const PORT = process.env.PORT || 4520;

type Address = {
    address: string,
    family: string,
    port: number
}

app.get("/health", (req, res) => {
    res.send({
        name: serviceConfig.name,
        description: serviceConfig.description,
        version: serviceConfig.version,
        status: "OK",
        modules: [
            {
                database: {
                    status: "OK"
                }
            }
        ]
    });
});

app.listen(PORT, () => {
    console.log(`Status Service started on ${host}:${PORT}`);

    const data = {
        name: serviceConfig.name,
        description: serviceConfig.description,
        version: serviceConfig.version,
        host: host,
        port: PORT
    }

    fs.writeFile("service-info.generated.json", JSON.stringify(data), 'utf8')
        .then(() => {
            console.log("Generated Service Info File Sucessfully");
        }) 
        .catch(e => { console.error(e) });
});


function exitHandler(e: Error) {
    fs.unlink("service-info.generated.json")
        .then(() => {
            console.log("Successfully removed service info file");

            if (e) {
                console.error(e);
            }

            process.exit();
        })
        .catch((e) => {
            console.error(e);
            process.exit();
        })
}

process.on('exit', exitHandler);
process.on('SIGINT', exitHandler);
process.on('SIGTERM', exitHandler);
process.on('uncaughtException', exitHandler);
