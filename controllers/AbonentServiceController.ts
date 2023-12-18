import { Request, Response } from "express";
import { Service } from "../models/src/models/Service";
import { ColumnOrder } from "../models/src/models/ColumnOrder";
import { createWriteStream } from "fs";
import * as xlsx from "xlsx";
import {Op} from "sequelize";
import * as path from 'path'; 


export class AbonentServiceController {
  public async getServices(req: Request, res: Response): Promise<void> {
    try {
      const column = req.query.column as string;
      const value = req.query.value as string;

      // Проверка наличия параметров запроса
      if (column && value) {
        const services = await Service.findAll({
          where: {
            [column]: {
              [Op.in]: value, // Используйте нужный оператор сравнения
            },
          },
        });
        res.json(services);
      } else {
        const allServices = await Service.findAll();
        res.json(allServices);
      }
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
  //   try {
  //     const services = await Service.findAll();
  //     res.json(services);
  //   } catch (error) {
  //     res.status(500).json({ error: "Internal server error" });
  //   }
  // }

  public async store(req: Request, res: Response): Promise<void> {
    if (!req.body.file && !req.body.serviceId && !req.body.identifierOrder) {
      res.status(400).json({ error: "don't have required paramerts" });
    }
      //Данную переменную надо потом убрать, костыль
    const paySum = req.body.paySumOrder === '' ? null : req.body.paySumOrder;


    ColumnOrder.findOne({ where: { service_id: req.body.serviceId } })
      .then((columnOrder) => {
        if (columnOrder) {
          // Запись найдена, выполняем обновление
          return columnOrder.update({
            identifier_order: req.body.identifierOrder,
            pay_sum_order: paySum
          });
        } else {
          // Запись не найдена, создаем новую
          return ColumnOrder.create({
            service_id: req.body.serviceId,
            identifier_order: req.body.identifierOrder,
            pay_sum_order: paySum
          });
        }
      })
      .then((result) => {
        console.log("Upsert operation completed.");
      })
      .catch((error) => {
        res.status(500).json("Upsert operation failed:" + error);
      });

    const splitted = req.body.file.split(";base64,");
    const format = splitted[0].replace(/^data:/, '');

    let fileData: any = '';

    if (format !== 'text/csv') {
      try {
          fileData = AbonentServiceController.convertXLSX(splitted[1]);
      } catch (error) {
        console.error('Error converting base64 to CSV:', error);
      throw error;
      }
    } else {
      fileData = Buffer.from(splitted[1], "base64");
    }
    
    // const outputFilePath = __dirname + "/../storage/" + req.body.serviceId + "_" + new Date().getTime().toString() + ".csv";
    const outputFilePath = path.join(__dirname, "/../../storage/clients") + req.body.serviceId + "_" + new Date().getTime().toString() + ".csv";


    const fileStream = createWriteStream(outputFilePath);
    
    fileStream.write(fileData+'\n');
    fileStream.end();

    fileStream.on("finish", () => {
      res.status(200).json({ response: "Successful" });
    });

    fileStream.on("error", (err) => {
      res.status(500).json({ error: "Not save file!" });
    });
    
  }

  public static convertXLSX(data: string) {
    const buffer = Buffer.from(data, "base64");
    const workbook = xlsx.read(buffer, { type: "buffer"});

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const csvData = xlsx.utils.sheet_to_csv(sheet);

    return csvData;
  }
}
