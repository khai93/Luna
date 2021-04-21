import { RequestHandler } from "express";

export const offlineMiddleware: RequestHandler = (req, res, next) => {
    res.status(503).send({online: false});
}