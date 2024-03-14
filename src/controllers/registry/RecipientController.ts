import {Request, Response} from "express";
import {Recipient} from "../../models/Recipient";
import {RecipientRegistry} from "../../models/RecipientRegistry";
import {sequelize} from "../../models";

export class RecipientController {

    public async store(req: Request, res: Response): Promise<void> {
        if (
            !req.body.name
            || !req.body.registry_ids
            || !req.body.emails
        ) {
            res.status(400).json({success: false, message:  "Отсутствуют обязательные поля"});
            return;
        }

        const {name, type, is_blocked, registry_ids} = req.body;

        const t = await sequelize.transaction();

        const filteredData: string[] = req.body.emails.filter((item: string) => item.trim() !== '');
        const emails: string = filteredData.join(', ');

        // console.log(req.body)
        try {
            const createdRecipient = await Recipient.create({
                name,
                type,
                emails,
                is_blocked,
            }, {transaction: t});

            if (Array.isArray(registry_ids)) {
                for (const registry_id of registry_ids) {
                    // console.log(registry_id)
                    await RecipientRegistry.create({
                        recipient_id: createdRecipient.id,
                        registry_id: registry_id,

                    }, {transaction: t});
                }
            }

            await t.commit();

            res.status(200).json({success: true, message: 'Получатель успешно создан'});
        } catch (error) {
            await t.rollback();
            res.status(500).json({success: false, message: `Произошла ошибка при создании получателя \n ${error}`});
        }
    }


    public async show(req: Request, res: Response): Promise<void> {
        const recipient_id = req.params.id;

        try {
            const recipient = await Recipient.findByPk(recipient_id);
            const recipientFiles = await RecipientRegistry.findAll({
                where: {recipient_id: recipient_id},
            });

            if (!recipient) {
                res.status(404).json({success: false, message:  "Получатель не найден"});
                return;
            }

            const recipientData = {
                id: recipient.id,
                name: recipient.name,
                type: recipient.type,
                emails: recipient.emails,
                is_blocked: recipient.is_blocked,
                createdAt: recipient.createdAt,
                updatedAt: recipient.updatedAt,

                registry_ids: recipientFiles.map((file) => ({
                    id: file.registry_id,
                })),
            };

            res.json(recipientData);
        } catch (error) {
            console.error("Get by ID operation failed:", error);
            res.status(500).json({success: false, message:  "Не удалось получить данные"});
        }
    }

    public async update(req: Request, res: Response): Promise<void> {
        if (
            !req.body.name
            || !req.body.registry_ids
            || !req.body.emails
        ) {
            res.status(400).json({success: false, message:  "Отсутствуют обязательные поля"});
            return;
        }
        const recipient_id = req.params.id;
        const filteredData: string[] = req.body.emails.filter((item: string) => item.trim() !== '');

        const emails: string = filteredData.join(', ');

        const {name, type, is_blocked, registry_ids} = req.body;
        try {

            const recipient = await Recipient.findByPk(recipient_id);
            if (!recipient) {
                res.status(404).json({success: false, message:  "Получатель не найден"});
                return;

            }

            recipient.name = name;
            recipient.type = type;
            recipient.emails = emails;
            recipient.is_blocked = is_blocked;

            await recipient.save();

            // Update RecipientsRegistriesRelation logic here
            if (registry_ids.length > 0) {
                // Delete existing relations
                await RecipientRegistry.destroy({
                    where: {
                        recipient_id: recipient.id,
                    },
                });

                // Create new relations
                for (const registry_id of registry_ids) {
                    await RecipientRegistry.create({
                        recipient_id: recipient.id,
                        registry_id: registry_id,
                    });
                }
            }

            res.status(200).json({success: true, message: 'Получатель успешно обновлён', recipient});
        } catch (error) {
            console.error("Update operation failed:", error);
            res.status(500).json({success: false, message:  "Не удалось обновить получателя"});
        }
    }

    public async destroy(req: Request, res: Response): Promise<void> {
        const recipient_id = req.params.id;

        // Начинаем транзакцию
        const t = await sequelize.transaction();

        try {
            // Удаляем связанные записи из другой таблицы
            await RecipientRegistry.destroy({
                where: {recipient_id: recipient_id},
                transaction: t
            });

            // Удаляем запись из таблицы Recipient
            const recipient = await Recipient.findByPk(recipient_id, {transaction: t});
            if (!recipient) {
                res.status(404).json({success: false, message:  "Получатель не найден"});
                return;
            }

            await recipient.destroy({transaction: t});

            // Фиксируем транзакцию
            await t.commit();

            res.status(200).json({success: true, message:  "Получатель успешно удалён"});
        } catch (error) {
            // Откатываем транзакцию в случае ошибки
            await t.rollback();

            console.error("Delete operation failed:", error);
            res.status(500).json({success: false, message:  `Не удалось удалить получателя \n ${error}` });
        }
    }


}
