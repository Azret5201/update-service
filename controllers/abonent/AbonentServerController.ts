import {Request, Response} from "express";
import {Service} from "../../models/src/models/Service";
import {Server} from "../../models/src/models/Server";

export class AbonentServerController {
    public async getServers(req: Request, res: Response): Promise<void> {
        try {
            const servers = await Server.findAll();
            res.json(servers);
        } catch (error) {
            res.status(500).json({error: "Internal server error"});
        }
    }

}
