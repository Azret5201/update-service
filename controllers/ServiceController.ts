import { Request, Response } from 'express';
import { Service } from '../models/src/models/Service';

export class ServiceController {

    public static async getServices(req: Request, res: Response): Promise<void> {
        try {
          const services = await Service.findAll();
    
          res.json(services);
        } catch (error) {
          res.status(500).json({ error: 'Internal server error' });
        }
      }
}