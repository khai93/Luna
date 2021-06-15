import express from 'express';
import axios from 'axios';

import serviceInfo from './service.json';

const app = express();

app.get("/", (req, res) => {
    res.send("OK");
});

app.listen(3023, () => {
    axios.post("http://localhost:80/registry/v1/services/" + serviceInfo.name + ":localhost:3023", {
        ...serviceInfo,
        instanceId: serviceInfo.name + ":" + "localhost:3023",
        url: "http://localhost:3023",
        status: "OK"
    }).then((response) => {
        console.log(response);
    }).catch(err => console.error)
    

    console.log("Status service started on port 3023");
});