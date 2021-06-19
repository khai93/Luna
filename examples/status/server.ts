import express from 'express';
import axios from 'axios';

import serviceInfo from './service.json';

const app = express();

const port = parseInt(process.env.PORT as string) || 3023;
const instanceId = serviceInfo.name + ":" + "localhost:" + port;
app.get("/", (req, res) => {
    console.log("Instance:" + port + " called");
    res.send("OK");
});

app.listen(port, () => {
    axios.post("http://localhost:4000/registry/v1/services/" + instanceId, {
        ...serviceInfo,
        instanceId,
        url: "http://localhost:" + port,
        status: "OK",
        balancerOptions: {
            weight: parseInt(process.env.WEIGHT as string) || 1
        }
    }).then((response) => {
        console.log("REGISTERED INSTANCE:" + port);
    }).catch(err => console.error)
    

    console.log("Status service started on port " + port);
});