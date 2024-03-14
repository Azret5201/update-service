import {Request, Response} from "express";
import {Registry} from '../../models/Registry';
import {RecipientRegistry} from '../../models/RecipientRegistry';
import {sequelize} from "../../models";

export class RegistryController {

    public async store(req: Request, res: Response): Promise<void> {
        if (
            !req.body.name
            || !req.body.servicesId
            || !req.body.serverId
            || !req.body.formats
        ) {
            res.status(400).json({success: false, message:  "Отсутствуют обязательные поля"});
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

            res.status(200).json({success: true, message: 'Реестр успешно создан'});
        } catch (error) {

            res.status(500).json({success: false, message: `Произошла ошибка при создании реестра \n ${error}`});
        }
    }

    public async show(req: Request, res: Response): Promise<void> {
        const fileId = req.params.id;

        Registry.findByPk(fileId)
            .then((registry) => {
                if (!registry) {
                    throw("Реестр не найден");
                }
                res.json(registry);
            })
            .catch((error) => {
                console.error("Show operation failed:", error);
                res.status(500).json({success: false, message:  `Не удалось получить данные: \n ${error}`});
            });
    }

    public async update(req: Request, res: Response): Promise<void> {
        const fileId = req.params.id;
        if (!req.body.serviceId && !req.body.table_headers && !req.body.name && (!req.body.fields || !req.body.sqlQuery)) {
            res.status(400).json({success: false, message:  "Отсутствуют обязательные поля"});
            return;
        }
        Registry.findByPk(fileId)
            .then((registry) => {
                if (!registry) {
                    throw("Реестр не найден");
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
                res.status(200).json({success: true, message: 'Реестр успешно обновлён', updatedRegistry});
            })
            .catch((error) => {
                console.error("Update operation failed:", error);

                res.status(500).json({success: false, message:  "Не удалось обновить реестр:", error});
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
                res.status(404).json({success: false, message:  "Реестр не найден"});
                return;
            }


            await registry.destroy({transaction: t});

            // Фиксируем транзакцию
            await t.commit();

            res.status(200).json({success: true, message:  "Реестр успешно удалён"});
        } catch (error) {
            // Откатываем транзакцию в случае ошибки
            await t.rollback();

            console.error("Delete operation failed:", error);
            res.status(500).json({success: false, message:  `Не удалось удалить реестр \n ${error}` });
        }
    }
}
