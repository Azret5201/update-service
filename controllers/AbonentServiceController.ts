import { Request, Response } from "express";
import { User } from "../models/src/models/User";
import { PathLike, createWriteStream } from "fs";
import { AbonentService } from "../models/src/models/AbonentService";

export class AbonentServiceController {
  public static async store(req: Request, res: Response): Promise<void> {
    if (!req.body.img && !req.body.service_id) {
      res.status(400).json({ error: "Not file!" });
    }

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
