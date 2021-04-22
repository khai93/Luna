import { RequestHandler } from "express";
import Middleware from "../../../common/middleware";

const offlineRequestHandler: RequestHandler = (req, res, next): void => {
    res.status(503).send({online: false});
}

export const offlineMiddleware = new Middleware(offlineRequestHandler);