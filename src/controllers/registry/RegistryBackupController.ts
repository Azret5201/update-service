import {Request, Response} from 'express';
import fs from 'fs';
import path from 'path';
import {getAbsolutePath} from "../../utils/pathUtils";
import moment from "moment";

export class RegistryBackupController {
    public async getBackups(req: Request, res: Response) {

        const registriesDirectory = getAbsolutePath('storage/registries/backup/'); // Путь к вашей директории

        try {
            // Проверьте, существует ли каталог
            if (!fs.existsSync(registriesDirectory)) {
                return res.status(404).end('Каталог не найден');
            }

            // Получите список файлов в каталоге с датой создания и размером файла
            let filteredFiles = fs.readdirSync(registriesDirectory).map((filename) => {
                const filePath = path.join(registriesDirectory, filename);
                const stats = fs.statSync(filePath);
                return {
                    name: filename,
                    size: stats.size, // Добавляем размер файла
                    createdAt: moment(stats.ctime).format("YYYY-MM-DD HH:mm:ss"), // Используем дату создания файла
                };
            });

            // Отсортируйте файлы по дате создания в убывающем порядке
            const sortedFiles = filteredFiles.sort((a: any, b: any) => b.createdAt - a.createdAt);

            const totalCount = filteredFiles.length;

            // Отправьте список файлов на клиент
            const response = {
                total: totalCount,
                data: sortedFiles, // Теперь передаем все данные о файлах
            };

            res.json(response);
        } catch (error) {
            console.error(error);
            res.status(500).json({error: "Внутренняя ошибка сервера"});
        }
    }


    public async downloadBackup(req: Request, res: Response) {
        const logsDirectory = getAbsolutePath('storage/registries/backup/'); // Используйте абсолютный путь
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

        // Определите MIME-тип для zip-файлов
        const mimeType = 'application/zip';

        // Отправьте zip-файл клиенту
        res.sendFile(filePath, {
            headers: {
                'Content-Type': mimeType,
            },
        });
    }

}
