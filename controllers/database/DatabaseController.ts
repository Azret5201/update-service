import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Sequelize, Model } from 'sequelize';

export class DatabaseControllerController {
    public async getDataFromDB(req: Request, res: Response): Promise<void> {
        try {
            const modelName = req.query.model as string;
            const Model = (Sequelize as any).models[modelName];

            if (!Model) {
                res.status(400).json({ error: `Model ${modelName} not found` });
                return;
            }

            const {
                attributes,
                sort,
                limit,
                offset } = req.query;
            const filters = req.query.filters as Record<string, string>;

            // Формирование условий фильтрации
            const whereConditions = filters
                ? Object.keys(filters).reduce((conditions: any, column) => {
                    conditions[column] = {
                        [Op.like]: `%${filters[column]}%`,
                    };
                    return conditions;
                }, {})
                : {};

            const options: any = {
                where: whereConditions,
            };

            // Выбор конкретных столбцов
            if (attributes) {
                options.attributes = (attributes as string).split(',');
            }

            // Ограничение количества записей
            if (limit) {
                options.limit = parseInt(limit as string, 10);
            }

            // Сортировка
            if (sort) {
                const [sortBy, sortOrder] = (sort as string).split(':');
                options.order = [[sortBy, sortOrder || 'ASC']];
            }

            // Пагинация
            if (offset) {
                options.offset = parseInt(offset as string, 10);
            }

            // Получение данных из БД с учетом опций
            const dataFromBD = await Model.findAll(options);
            res.json(dataFromBD);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
