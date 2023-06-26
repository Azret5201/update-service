import { Request, Response } from "express";
import { Service } from "../models/src/models/Service";
import { ColumnOrder } from "../models/src/models/ColumnOrder";
import { PathLike, createWriteStream } from "fs";

export class RegistryServiceController {
  public async getRegistryServices(req: Request, res: Response): Promise<void> {
    try {
      const registryServices = await Service.findAll();
      res.json(registryServices);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }

  public async store(req: Request, res: Response): Promise<void> {
    if (!req.body.file && !req.body.serviceId && !req.body.serverId) {
      res.status(400).json({ error: "don't have required paramerts" });
    }

    ColumnOrder.findOne({ where: { service_id: req.body.serviceId } })
      .then((columnOrder) => {
        if (columnOrder) {
          // Запись найдена, выполняем обновление
          return columnOrder.update({
            serverId: req.body.serverId,
            title: req.body.title,
            tableHeaders: req.body.tableHeaders,
            fields: req.body.fields,
            sql: req.body.sql,
            pay_sum_order: req.body.paySumOrder,
          });
        } else {
          // Запись не найдена, создаем новую
          return ColumnOrder.create({
            serverId: req.body.serverId,
            title: req.body.title,
            tableHeaders: req.body.tableHeaders,
            fields: req.body.fields,
            sql: req.body.sql,
            pay_sum_order: req.body.paySumOrder,
          });
        }
      })
      .then((result) => {
        console.log("Upsert operation completed.");
      })
      .catch((error) => {
        res.status(500).json("Upsert operation failed:" + error);
      });
  }
}
