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
    if (!req.body.file && !req.body.serviceId && !req.body.identifierOrder) {
      res.status(400).json({ error: "don't have required paramerts" });
    }

    ColumnOrder.findOne({ where: { service_id: req.body.serviceId } })
      .then((columnOrder) => {
        if (columnOrder) {
          // Запись найдена, выполняем обновление
          return columnOrder.update({
            identifier_order: req.body.identifierOrder,
            pay_sum_order: req.body.paySumOrder,
          });
        } else {
          // Запись не найдена, создаем новую
          return ColumnOrder.create({
            service_id: req.body.serviceId,
            identifier_order: req.body.identifierOrder,
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

    const outputFilePath = __dirname + "/../storage/" + req.body.serviceId + new Date().getTime().toString() + ".csv";

    const base64Content = req.body.file.split(";base64,").pop();
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
