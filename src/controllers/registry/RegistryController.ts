import {Request, Response} from "express";
import sequelize from "../../../config/sequelize";
import {Op} from "sequelize";
import {Registry} from '../../models/Registry';
import {RecipientRegistry} from '../../models/RecipientRegistry';

export class RegistryController {
    public static async searchRegistriesWithRelated(column: string, value: string) {
        const whereClause = {[column]: `${value}`};

        const recipientRegistries = await RecipientRegistry.findAll({
            where: whereClause,
        });

        const registryIds = recipientRegistries.map((relation) => relation.registryId);

        return await Registry.findAll({
            where: {
                id: registryIds,
            },
            attributes: ['id', 'name', 'server_id', 'formats', 'services_id']
        });
    }

    public async getRegistryPage(req: Request, res: Response): Promise<void> {
        const pageNumber = req.query.page ? parseInt(req.query.page as string) : 1;
        const pageSize = 50;
        const offset = (pageNumber - 1) * pageSize;
        const searchTerm = req.query.search;

        const whereClause: any = {}; // Пустой объект для условий поиска

        if (searchTerm) {
            whereClause['name'] = {
                [Op.iLike]: `%${searchTerm}%`, // Используем оператор Op.iLike для регистронезависимого поиска похожих записей
            };
        }

        try {
            const totalCount = await Registry.count({where: whereClause});
            const totalPages = Math.ceil(totalCount / pageSize);
            const results = await Registry.findAll({
                where: whereClause,
                limit: pageSize,
                offset: offset,
                order: [['id', 'desc']],
            });

            const response = {
                total: totalCount,
                per_page: pageSize,
                current_page: pageNumber,
                last_page: totalPages,
                from: offset + 1,
                to: offset + results.length,
                data: results,
            };

            res.json(response);
        } catch (error) {
            res.status(500).json({error: "Internal server error"});
        }
    }

    public async getRegistries(req: Request, res: Response): Promise<void> {
        try {
            const column = req.query.column as string;
            const value = req.query.value as string;
            const includeRelated = req.query.includeRelated as string;
            if (column && value) {
                let registries;
                if (includeRelated && includeRelated.toLowerCase() === 'true') {

                    registries = await RegistryController.searchRegistriesWithRelated(column, value);
                    console.log(includeRelated)
                } else {
                    const whereClause = {[column]: {[Op.like]: `%${value}%`}};
                    registries = await Registry.findAll({where: whereClause});
                }

                res.json(registries);
            } else {
                const allRegistries = await Registry.findAll();
                res.json(allRegistries);
            }
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({error: 'Internal server error'});
        }
    }

    public async store(req: Request, res: Response): Promise<void> {
        if (
            !req.body.name
            || !req.body.servicesId
            || !req.body.serverId
            || !req.body.formats
        ) {
            res.status(400).json({error: "Required parameters are missing"});
            return;
        }

        try {
            await Registry.create({
                name: req.body.name,
                services_id: req.body.servicesId,
                server_id: req.body.serverId,
                fields: req.body.fields,
                table_headers: req.body.tableHeaders,
                formats: req.body.formats,
                is_blocked: req.body.is_blocked,
                sql_query: req.body.sqlQuery,
            });

            res.json({message: "Record created"});
        } catch (error) {
            console.error("Create operation failed:", error);
            res.status(500).json({error: "Create operation failed"});
        }
    }

    public async show(req: Request, res: Response): Promise<void> {
        const fileId = req.params.id;

        Registry.findByPk(fileId)
            .then((registry) => {
                if (!registry) {
                    res.status(404).json({error: "Registry file not found"});
                    return;
                }
                res.json(registry);
            })
            .catch((error) => {
                console.error("Show operation failed:", error);
                res.status(500).json({error: "Show operation failed"});
            });
    }

    public async update(req: Request, res: Response): Promise<void> {
        const fileId = req.params.id;
        if (!req.body.serviceId && !req.body.table_headers && !req.body.name && (!req.body.fields || !req.body.sqlQuery)) {
            res.status(400).json({error: "Required parameters are missing"});
            return;
        }
        Registry.findByPk(fileId)
            .then((registry) => {
                if (!registry) {
                    res.status(404).json({error: "Registry file not found"});
                    return;
                }

                registry.name = req.body.name;
                registry.services_id = req.body.servicesId;
                registry.server_id = req.body.serverId;
                registry.fields = req.body.fields;
                registry.table_headers = req.body.tableHeaders;
                registry.is_blocked = req.body.is_blocked;
                registry.formats = req.body.formats;
                registry.sql_query = req.body.sqlQuery;

                return registry.save();

            })
            .then((updatedRegistry) => {
                res.json(updatedRegistry);
            })
            .catch((error) => {
                console.error("Update operation failed:", error);

                res.status(500).json({error: "Update operation failed"});
            });
    }


    public async destroy(req: Request, res: Response): Promise<void> {
        const registry_id = req.params.id;

        // Начинаем транзакцию
        const t = await sequelize.transaction();

        try {
            // Удаляем связанные записи из другой таблицы
            await RecipientRegistry.destroy({
                where: {registry_id: registry_id},
                transaction: t
            });


            // Удаляем запись из таблицы Registry
            const registry = await Registry.findByPk(registry_id, {transaction: t});
            if (!registry) {
                res.status(404).json({error: "Registry not found"});
                return;
            }


            await registry.destroy({transaction: t});

            // Фиксируем транзакцию
            await t.commit();

            res.json({message: "Registry and related records deleted successfully"});
        } catch (error) {
            // Откатываем транзакцию в случае ошибки
            await t.rollback();

            console.error("Delete operation failed:", error);
            res.status(500).json({error: "Delete operation failed"});
        }
    }
}
