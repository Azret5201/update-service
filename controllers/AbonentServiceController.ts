import { Request, Response } from "express";
import { Service } from "../models/src/models/Service";
import { ColumnOrder } from "../models/src/models/ColumnOrder";
import { PathLike, createWriteStream } from "fs";
import { AbonentService } from "../models/src/models/AbonentService";

export class AbonentServiceController {
  public static async getServices(req: Request, res: Response): Promise<void> {
    try {
      const services = await Service.findAll();

      res.json(services);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }

  public static async store(req: Request, res: Response): Promise<void> {
    if (!req.body.img && !req.body.service_id && !req.body.identifierOrder && req.body.paySumOrder) {
      res.status(400).json({ error: "Not file!" });
    }

    ColumnOrder.findOne({ where: { service_id: req.body.service_id } })
      .then((columnOrder) => {
        if (columnOrder) {
          // Запись найдена, выполняем обновление
          return columnOrder.update({
            identifier_order: req.body.identifier_order,
            pay_sum_order: req.body.pay_sum_order,
          });
        } else {
          // Запись не найдена, создаем новую
          return ColumnOrder.create({
            service_id: req.body.service_id,
            identifier_order: req.body.identifierOrder,
            pay_sum_order: req.body.paySumOrder,
          });
        }
      })
      .then((result) => {
        console.log("Upsert operation completed.");
      })
      .catch((error) => {
        console.error("Upsert operation failed:", error);
      });

    const outputFilePath = __dirname + "/../storage/" + req.body.service_id + new Date().getTime().toString() + ".csv";

    const base64Content = req.body.img.split(";base64,").pop();
    const fileStream = createWriteStream(outputFilePath);
    fileStream.write(Buffer.from(base64Content, "base64"));
    fileStream.end();

    fileStream.on("finish", () => {
      res.status(200).json({ response: "Successful" });
    });

    fileStream.on("error", (err) => {
      res.status(500).json({ error: "Not save file!" });
    });
  }
}