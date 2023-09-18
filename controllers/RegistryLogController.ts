import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import {Op} from "sequelize";

export class RegistryLogController {
    public async getLogs(req: Request, res: Response) {
        const pageNumber = req.query.page ? parseInt(req.query.page as string) : 1;
        const pageSize = 50;
        const offset = (pageNumber - 1) * pageSize;
        const searchTerm = req.query.search;

        const whereClause: any = {}; // Пустой объект для условий поиска

        if (searchTerm) {
            whereClause['name'] = {
                [Op.like]: `%${searchTerm}%`, // Используем оператор Op.like для поиска похожих записей
            };
        }

        const logsDirectory = path.join(__dirname, './../logs'); // Путь к вашей директории

        try {
            // Проверьте, существует ли каталог
            if (!fs.existsSync(logsDirectory)) {
                return res.status(404).end('Directory not found');
            }

            // Получите список файлов в каталоге с датой создания
            const filesWithStats: any = fs.readdirSync(logsDirectory).map((filename) => {
                const filePath = path.join(logsDirectory, filename);
                const stats = fs.statSync(filePath);
                return {
                    name: filename,
                    createdAt: stats.ctime // Используем дату создания файла
                };
            });

            // Отсортируйте файлы по дате создания в убывающем порядке
            const sortedFiles = filesWithStats.sort((a: any, b: any) => b.createdAt - a.createdAt);

            // Примените смещение (offset) и размер страницы (pageSize) к списку файлов
            const paginatedFiles = sortedFiles.slice(offset, offset + pageSize).map((file: any) => file.name);

            const totalCount = sortedFiles.length;
            const totalPages = Math.ceil(totalCount / pageSize);

            // Отправьте список файлов на клиент
            const response = {
                total: totalCount,
                per_page: pageSize,
                current_page: pageNumber,
                last_page: totalPages,
                from: offset + 1,
                to: offset + paginatedFiles.length,
                data: paginatedFiles,
            };

            res.json(response);
        } catch (error) {
            console.error(error);
            res.status(500).json({error: "Internal server error"});
        }
    }

    public async downloadLog(req: Request, res: Response) {
        const logsDirectory = path.join(__dirname, './../logs/'); // Используйте абсолютный путь
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
