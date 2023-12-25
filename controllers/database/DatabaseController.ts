import { Request, Response } from 'express';
import { Op, Sequelize } from 'sequelize';
import sequelize from "../../models/src/sequelize";

export class DatabaseControllerController {
    public async getDataFromDB(req: Request, res: Response): Promise<void> {
        try {
            const modelName = req.query.model as string;
            const Model = sequelize.models[modelName];

            if (!Model) {
                res.status(400).json({ error: `Model ${modelName} not found` });
                return;
            }

            const {
                attributes,
                sort,
                limit,
                filters: filtersParam,
                offset
            } = req.query;

            let whereConditions = {};
            let filters: any;

            if (filtersParam && filtersParam !== 'undefined') {
                try {
                    filters = JSON.parse(filtersParam as string);

                    if (typeof filters === 'string' || filters instanceof String) {
                        // Если filters - это строка (обычное значение), то ищем по всем столбцам
                        const searchTerm = `%${filters}%`;
                        whereConditions = {
                            [Op.or]: Object.keys(Model.rawAttributes).map((column) => ({
                                [column]: {
                                    [Op.iLike]: searchTerm,
                                },
                            })),
                        };
                    } else if (typeof filters === 'object' && filters !== null) {
                        // Если filters - это объект JSON, то ищем только по указанным столбцам
                        whereConditions = {
                            [Op.or]: Object.keys(filters).map((column) => ({
                                [column]: {
                                    [Op.iLike]: `%${filters[column]}%`,
                                },
                            })),
                        };
                    } else {
                        // Некорректный формат filters
                        res.status(400).json({ error: 'Invalid filters format' });
                        return;
                    }

                } catch (error) {
                    console.error(error);
                    res.status(400).json({ error: 'Invalid filters format' });
                    return;
                }
            }

            const options: any = {
                where: whereConditions,
            };

            // Выбор конкретных столбцов
            if (attributes && attributes !== 'undefined') {
                options.attributes = (attributes as string)
                    .split(',')
                    .map(attribute => attribute.trim())
                    .filter(attribute => attribute !== '');
            }

            // Ограничение количества записей
            if (limit && limit !== 'undefined') {
                options.limit = parseInt(limit as string, 10);
            }

            // Сортировка
            if (sort && sort !== 'undefined') {
                const [sortBy, sortOrder] = (sort as string).split(':');
                const orderByColumn = sequelize.literal(`(${Object.keys(Model.rawAttributes).map((column) =>
                    `CASE WHEN "${column}" ILIKE '%${filters[column]}%' THEN 1 ELSE 0 END`
                ).join(' + ')}) ${sortOrder || 'ASC'}`);

                options.order = [
                    [sortBy, sortOrder || 'ASC'],
                    orderByColumn
                ];
            }

            // Пагинация
            if (offset && offset !== 'undefined') {
                options.offset = parseInt(offset as string, 10);
            }

            // Получение данных из БД с учетом опций
            const dataFromBD = await Model.findAll(options);
            const count = await Model.count(options);
            res.json({ count, data: dataFromBD });
        } catch (original) {
            console.error(original);
            res.status(500).json({ error: 'Ошибка при запросе к базе. ' + original });
        }
    }
}
