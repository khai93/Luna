import express from 'express';
import fs from 'fs/promises';
import fsSync from 'fs';
import http from 'http';
import { AddressInfo } from 'node:net';
import axios from 'axios';

const serviceConfig = JSON.parse(fsSync.readFileSync("service.json", "utf8"));

const app = express();
const host = process.env.HOST || '127.0.0.1';
const PORT = process.env.PORT || 4520;
const registryServerBaseUrl = "http://localhost:3000/";
const servicesApiURL = new URL("luna/v1/services/" + serviceConfig.name, registryServerBaseUrl);

const registryInstance = axios.create({
    baseURL: registryServerBaseUrl.toString()
});

app.get("/", (req, res) => {
    res.send({
        name: serviceConfig.name,
        description: serviceConfig.description,
        version: serviceConfig.version,
        status: "OK",
        online: true,
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
        https: serviceConfig.https,
        host: host,
        port: PORT,
        online: true
    };

    registryInstance.post(servicesApiURL.toString(), data)
        .then(() => {
            console.log("Registered status service.");

            startHeartbeats();
        })
        .catch(e => { throw e });
});

function startHeartbeats() {
    const data = {
        name: serviceConfig.name,
        description: serviceConfig.description,
        version: serviceConfig.version,
        https: serviceConfig.https,
        host: host,
        port: PORT,
        online: true
    };

    setTimeout(() => {
        registryInstance.put(servicesApiURL.toString(), data)
        .then(() => {
            console.log("Sent heartbeat.");
            startHeartbeats();
        })
        .catch(e => { throw e });
    }, 30000)
}


function exitHandler(e: Error) {
    registryInstance.delete(servicesApiURL.toString())
        .then(() => {
            console.log("Deregistered status service.");
            process.exit();
        })
        .catch(e => {
            console.error(e);
            process.exit();
        });
}

process.on('exit', exitHandler);
process.on('SIGINT', exitHandler);
process.on('SIGTERM', exitHandler);
process.on('uncaughtException', exitHandler);
