import express, { Response, Request } from 'express';
import fsSync from 'fs';
import axios from 'axios';

const serviceConfig = JSON.parse(fsSync.readFileSync("service.json", "utf8"));

const instance1 = express();
const instance2 = express();
const url = new URL('http://localhost:4520');
const url2 = new URL('http://localhost:1234');
const hostname = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 4520;
const PORT2 = 1234;
const registryServerBaseUrl = "http://localhost:3000/";

const data = {
    instanceId: `${serviceConfig.name}:${hostname}:${PORT}`,
    name: serviceConfig.name,
    description: serviceConfig.description,
    version: serviceConfig.version,
    status: "OK",
    balancerOptions: {
        weight: 2
    },
    url: url.toString()
};

const data2 = {
    instanceId: `${serviceConfig.name}:${hostname}:${PORT2}`,
    name: serviceConfig.name,
    description: serviceConfig.description,
    version: serviceConfig.version,
    status: "OK",
    balancerOptions: {
        weight: 1
    },
    url: url2.toString()
}

const servicesApiURL = new URL("luna/v1/services/" + data.instanceId, registryServerBaseUrl);
const servicesApiURL2 = new URL("luna/v1/services/" + data2.instanceId, registryServerBaseUrl);

const registryInstance = axios.create({
    baseURL: registryServerBaseUrl.toString()
});


const instanceHealthCheckHandler = (instanceNum: number) => (req: Request, res: Response) => {
    console.log(`Instance ${instanceNum}: Health check`);

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
}

instance1.get("/", instanceHealthCheckHandler(1));
instance2.get("/", instanceHealthCheckHandler(2));

instance1.listen(PORT, () => {
    console.log(`Status Service 1 started on ${hostname}:${PORT}`);

    registryInstance.post(servicesApiURL.toString(), data)
        .then(() => {
            console.log("Registered status service 1.");

            startHeartbeat(1);
        })
        .catch(e => { throw e });
});

instance2.listen(PORT2, () => {
    console.log(`Status Service 2 started on ${hostname}:${PORT2}`);

    registryInstance.post(servicesApiURL2.toString(), data2)
        .then(() => {
            console.log("Registered status service 2.");

            startHeartbeat(2);
        })
        .catch(e => { throw e });
});


function startHeartbeat(instanceNum: number) {
    setTimeout(() => {
        let downData = data;

        if (instanceNum = 2) {
            downData = data2;
            downData.status = "DOWN";
        }

        registryInstance.put(instanceNum == 2 ? servicesApiURL2.toString() : servicesApiURL.toString(), downData)
        .then(() => {
            console.log("Sent heartbeat.");
            startHeartbeat(instanceNum);
        })
        .catch(e => { throw e });
    }, 30000);
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
