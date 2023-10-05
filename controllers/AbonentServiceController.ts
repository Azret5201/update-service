import { Request, Response } from "express";
import { Service } from "../models/src/models/Service";
import { ColumnOrder } from "../models/src/models/ColumnOrder";
import { PathLike, createWriteStream, createReadStream, writeFileSync, appendFileSync } from "fs";
import * as xlsx from "xlsx";
import * as mimeTypes from "mime-types";


export class AbonentServiceController {
  public async getServices(req: Request, res: Response): Promise<void> {
    try {
      const services = await Service.findAll();
      res.json(services);
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

    const splitted = req.body.file.split(";base64,");
    const format = splitted[0].replace(/^data:/, '');

    let fileData = '';
    if (format !== 'text/csv') {
      try {
        if (mimeTypes.extension(format) === 'xlsx') {

          fileData = AbonentServiceController.convertXLSX(splitted[1]);
        } else {
          // AbonentServiceController.convertDBF(splitted[1]);
        }
      } catch (error) {
        console.error('Error converting base64 to CSV:', error);
      throw error;
      }
    } 

    // const data = typeof fileData === 'string' ? fileData :  Buffer.from(splitted[1], "base64");
    
    // const outputFilePath = __dirname + "/../storage/" + req.body.serviceId + "_" + new Date().getTime().toString() + ".csv";

    // const fileStream = createWriteStream(outputFilePath);
    // fileStream.write(data);
    // fileStream.end();


    // fileStream.on("finish", () => {
    //   res.status(200).json({ response: "Successful" });
    // });

    // fileStream.on("error", (err) => {
    //   res.status(500).json({ error: "Not save file!" });
    // });
    
  }

  public static convertXLSX(data: string) {
    const buffer = Buffer.from(data, "base64");
    const workbook = xlsx.read(buffer, { type: "buffer"});

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const csvData = xlsx.utils.sheet_to_csv(sheet);

    return csvData;
  }
      
      
      // public static async convertDBF(data: string) {

      //   const dbfBuffer = Buffer.from(data, 'base64');
      //   const csvFilePath = __dirname + '/../storage/dbfTest.csv';
      //   const csvStream = createWriteStream(csvFilePath);
      //   csvStream.write(data);

      //   const size = 20;
      //   const decodeDbfBuffer = iconv.decode(dbfBuffer, 'win1251');

        // const typeReplacements = {
        //   string: 'C',
        //   numeric: 'N',
        //   float: 'F',
        //   integer: 'I',
        //   date: 'D',
        //   datetime: 'T',
        //   double: 'B',
        // };
       

        // // write header to dbf
        // const datatable: DataTable = Dbf.read(dbfBuffer);

        // const columnsWithSize = datatable.columns.map(column => ({
        //    ...column, 
        //    type: typeReplacements[column.type] || column.type,
        //    size
        //   }));
        // let dbf = await DBFFile.create(csvFilePath, columnsWithSize);

        // dbf.appendRecords(datatable);


        // datatable.rows.forEach((row) => {
          // console.log(iconv.decode(row.PAYER_NAME, 'win1251'));
        // })

      // // let dbf = await DBFFile.create('temp.dbf', fieldDescriptors);
        // writeFileSync('temp.dbf', dbfBuffer);

        // const stringFromBuffer = dbfBuffer.toString("latin1");
        // // let dbf = await DBFFile.open(stringFromBuffer);
        // console.log(stringFromBuffer);
        // console.log(dbf);
      //   let decode = new TextDecoder

        


      //   for await (let record of dbf) console.log();
      // }
}
