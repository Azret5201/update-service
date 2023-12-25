import { Request, Response } from "express";
import multer from "multer";
import XLSX from "xlsx";
import {TSJDealer} from "../../../models/src/models/TSJDealer";
import { Sequelize } from 'sequelize';
import sequelize from "../../../models/src/sequelize";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single('dialerUploadFile');

export class TSJDealerController {

    public async getTSJDealers(req: Request, res: Response): Promise<void> {
        try {
            const allDealers = await TSJDealer.findAll();
            res.json(allDealers);
        } catch (error) {
            res.status(500).json({ error: "Internal server error" });
        }
    }


    // Ваш updateDealer
    public async updateDealer(req: Request, res: Response) {
        try {
            await new Promise<void>((resolve, reject) => {
                upload(req, res, (err: any) => {
                    if (err) {
                        reject({ type: "error", message: 'Ошибка при загрузки файла', err });
                    } else {
                        resolve();
                    }
                });
            });

            const dialerUploadFile: Express.Multer.File | undefined = req.file;

            if (!dialerUploadFile) {
                return res.status(400).json({ type: "error", message: 'Фаил со списком дилеров обязателен' });
            }
            // Проверка формата файла
            if (dialerUploadFile.mimetype !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
                return res.status(400).json({ type: "error", message: 'Формат файла должен быть .xlsx' });
            }


            try {
                // Здесь вы можете обработать файл, например, считать его содержимое
                const result = await readExcelFile(dialerUploadFile.buffer);

                if (result.success) {
                    res.status(200).json({ type: "success", message: result.message });
                } else {
                    console.error('Error processing file:', result.message);
                    res.status(500).json({ type: "error", message: result.message });
                }

            } catch (error) {
                console.error('Error processing file:', error);
                res.status(500).json({ type: "error", error: 'Не удалось считать фаил' });
            }

        } catch (error) {
            console.error('Error processing file:', error);
            res.status(500).json({ type: "error", error: 'Внутренняя ошибка.' });
        }
    }


}

async function readExcelFile(dialerUploadFile: Buffer): Promise<{ success: boolean; message?: string; error?: string }> {
    const transaction = await sequelize.transaction();

    try {
        const dataFromExcel: any[] = [];
        const workbook = XLSX.read(dialerUploadFile, { type: 'buffer' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Проверяем, что все обязательные поля не пусты
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (row[0]) {
                const createdTSJDealer = {
                    code: row[0],
                    name: row[1],
                    address: row[2],
                    fio: row[3],
                    inn: row[4],
                    okpo: row[5],
                    bank: row[6],
                    bik: row[7],
                    bank_account: row[8],
                    accountant: row[9],
                };
                console.log(createdTSJDealer);
                dataFromExcel.push(createdTSJDealer);
            } else {
                // console.error('Skipped row due to missing required fields:', i, row);
            }
        }

        // Удаление всех записей
        await TSJDealer.destroy({ truncate: true, transaction });

        // Создание записей
        await TSJDealer.bulkCreate(dataFromExcel, { transaction });

        // Если все успешно, коммитим изменения
        await transaction.commit();

        return { success: true, message: 'Список дилеров успешно обновлён.' };
    } catch (error) {
        console.error('Error processing file:', error);

        // Если произошла ошибка, откатываем изменения
        await transaction.rollback();

        return { success: false, message: `Ошибка при обновлении дилеров: ${error}` };
    }
}