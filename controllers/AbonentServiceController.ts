import { Request, Response } from 'express';
import { Service } from '../models/src/models/Service';
import { ColumnOrders } from '../models/src/models/ColumnOrders';
import { DataClientParser } from '../models/src/models/DataClientParser';

export class AbonentServiceController {

    public static async getServices(req: Request, res: Response): Promise<void> {
        try {
          const services = await Service.findAll();
    
          res.json(services);
        } catch (error) {
          res.status(500).json({ error: 'Internal server error' });
        }
      }

      public static async getProperties(req: Request, res: Response): Promise<void> {
        const serviceId = req.params.id;
        try {
          const fields = await ColumnOrders.findOne({
            where: {service_id: Number(serviceId)}
          })
          
          const parsers = await DataClientParser.findAll();

          if(fields || parsers.length > 0) {
            res.json({ fields,  parsers});
          } else {
            res.status(404).json({ error: 'No ' });
          }
        } catch (error) {
          console.error('Error retrieving data:', error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      }
      
}