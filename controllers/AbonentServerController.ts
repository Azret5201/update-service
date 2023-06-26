import {Request, Response} from "express";
import {Service} from "../models/src/models/Service";

export class AbonentServerController {
    public async getServers(req: Request, res: Response): Promise<void> {
        try {
            const services = await Service.findAll();
            res.json(services);
        } catch (error) {
            res.status(500).json({error: "Internal server error"});
        }
    }

}
