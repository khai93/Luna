import express from 'express';
import fsSync from 'fs';
import axios from 'axios';

const serviceConfig = JSON.parse(fsSync.readFileSync("service.json", "utf8"));

const app = express();
const url = new URL('http://localhost:4520');
const hostname = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 4520;
const registryServerBaseUrl = "http://localhost:3000/";

const data = {
    instanceId: `${serviceConfig.name}:${hostname}:${PORT}`,
    name: serviceConfig.name,
    description: serviceConfig.description,
    version: serviceConfig.version,
    status: "OK",
    url: url.toString()
};

const servicesApiURL = new URL("luna/v1/services/" + data.instanceId, registryServerBaseUrl);
const registryInstance = axios.create({
    baseURL: registryServerBaseUrl.toString()
});

app.get("/", (req, res) => {
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
    console.log(`Status Service started on ${hostname}:${PORT}`);

    registryInstance.post(servicesApiURL.toString(), data)
        .then(() => {
            console.log("Registered status service.");

            startHeartbeat();
        })
        .catch(e => { throw e });
});

function startHeartbeat() {

    setTimeout(() => {
        const downData = data;
        downData.status = "DOWN";

        registryInstance.put(servicesApiURL.toString(), downData)
        .then(() => {
            console.log("Sent heartbeat.");
            startHeartbeat();
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
