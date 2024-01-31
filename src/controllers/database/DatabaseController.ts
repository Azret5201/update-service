import { Request, Response } from 'express';
import { Op, Sequelize } from 'sequelize';
import sequelize from '../../../config/sequelize';

export class DatabaseController {
    public async getDataFromDB(req: Request, res: Response): Promise<void> {

        try {
            const modelName = req.query.model as string;
            const Model = sequelize.models[modelName];

            if (!Model) {
                res.status(400).json({ error: `Model ${modelName} not found` });
                return;
            }

            const { attributes, sort, limit, filters: filtersParam, offset } = req.query;

            let whereConditions: Record<string, any> = {};
            let filters: any;

            if (filtersParam && filtersParam !== 'undefined' && filtersParam !== '{}') {
                try {
                    filters = JSON.parse(filtersParam as string);

                    if (typeof filters !== 'object' || filters === null) {
                        throw new Error('Invalid filters format');
                    }

                    // Если filters - это объект JSON, то ищем только по указанным столбцам
                    whereConditions = {
                        [Op.or]: Object.keys(filters).map((column) => {
                            // Проверка, существует ли столбец в модели
                            if (Model.rawAttributes[column]) {
                                // Если значения столбца - это массив, использовать Op.in
                                if (Array.isArray(filters[column])) {
                                    return {
                                        [column]: {
                                            [Op.in]: filters[column],
                                        },
                                    } as Record<string, any>;
                                }

                                const searchTerm = `%${filters[column]}%`;

                                // Проверка наличия параметра accurateSearch и его значения
                                if (filters.accurateSearch === true) {

                                    // Точный поиск для конкретного столбца
                                    return {
                                        [column]: Sequelize.literal(`"${column}"::text = '${filters[column]}'`),
                                    } as Record<string, any>;
                                } else {
                                    // Для остальных столбцов или если accurateSearch не указан или равен true, использовать нечеткий поиск
                                    return {
                                        [column]: Sequelize.literal(`"${column}"::text ILIKE '${searchTerm}'`),
                                    } as Record<string, any>;
                                }
                            }
                            return null;
                        }).filter(Boolean),
                    };
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
                const { column, direction } = JSON.parse(sort as any);

                // Проверка, что столбец существует в модели
                if (Object.keys(Model.rawAttributes).includes(column)) {
                    let orderByColumn;

                    if (filters) {
                        // Если filters определен, добавляем условие ILIKE к сортировке
                        orderByColumn = sequelize.literal(`(${Object.keys(Model.rawAttributes).map((col) =>
                            `CASE WHEN "${col}"::text ILIKE '%${filters[col]}%'::text THEN 1 ELSE 0 END`
                        ).join(' + ')}), "${Model.rawAttributes[column].field}"::text ${direction || 'ASC'}`);
                    } else {
                        // Иначе используем простую сортировку по столбцу
                        if (column === 'id') {
                            orderByColumn = [[column, direction]];
                        } else {
                            orderByColumn = [sequelize.literal(`CAST("${Model.rawAttributes[column].field}" AS text)`), direction || 'ASC'];
                        }
                    }

                    options.order = [orderByColumn];
                } else {
                    const idColumnExists = Object.keys(Model.rawAttributes).includes('id');

                    if (idColumnExists) {
                        options.order = [['id', 'DESC']];
                    }
                }
            }

            // Пагинация
            if (offset && offset !== 'undefined') {
                options.offset = parseInt(offset as string, 10);
            }

            // Получение данных из БД с учетом опций
            const dataFromBD = await Model.findAll(options);
            const count = await Model.count(options);

            res.json({ count, data: dataFromBD });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: `Error querying the database. ${error}` });
        }
    }
}
