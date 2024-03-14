import {Request, Response} from 'express';
import fs from 'fs';
import path from 'path';
import {getAbsolutePath} from "../../utils/pathUtils";
import moment from "moment/moment";

export class RegistryLogController {
    public async getLogs(req: Request, res: Response) {
        const logsDirectory = getAbsolutePath('logs/registries/'); // Путь к вашей директории

        try {
            // Проверьте, существует ли каталог
            if (!fs.existsSync(logsDirectory)) {
                return res.status(404).end('Directory not found');
            }

            // Получите список файлов в каталоге с датой создания
            let filteredFiles = fs.readdirSync(logsDirectory).map((filename) => {
                const filePath = path.join(logsDirectory, filename);
                const stats = fs.statSync(filePath);
                return {
                    name: filename,
                    size: stats.size, // Добавляем размер файла
                    createdAt: moment(stats.ctime).format("YYYY-MM-DD HH:mm:ss"), // Используем дату создания файла
                };
            });

            // Отсортируйте файлы по дате создания в убывающем порядке
            const sortedFiles = filteredFiles.sort((a: any, b: any) => b.createdAt - a.createdAt);

            // Примените смещение (offset) и размер страницы (pageSize) к списку файлов

            const totalCount = filteredFiles.length;

            // Отправьте список файлов на клиент
            const response = {
                total: totalCount,
                data: sortedFiles, // Теперь передаем все данные о файлах
            };


            res.json(response);
        } catch (error) {
            console.error(error);
            res.status(500).json({error: "Internal server error"});
        }
    }


    public async downloadLog(req: Request, res: Response) {
        const logsDirectory = getAbsolutePath('logs/registries/'); // Используйте абсолютный путь
        const filename = req.body.filename;

        // Проверьте, существует ли каталог с логами
        if (!fs.existsSync(logsDirectory)) {
            return res.status(404).end('Logs not found');
        }

        const filePath = path.join(logsDirectory, filename);

        // Проверьте, существует ли запрошенный файл
        if (!fs.existsSync(filePath)) {
            return res.status(404).end('File not found');
        }

        // Читаем содержимое файла
        fs.readFile(filePath, 'utf8', (err, fileData) => {
            if (err) {
                console.error(err);
                return res.status(500).json({error: "Error reading file"});
            }

            // Отправляем содержимое файла клиенту
            res.status(200).send(fileData);
        });
    }
}
