import {Request, Response} from "express";
import {Recipient} from "../../models/src/models/registry/Recipient";
import {RecipientsRegistriesRelation} from "../../models/src/models/registry/RecipientsRegistriesRelation";
import sequelize from "../../models/src/sequelize";
import {Op} from "sequelize";

export class RecipientController {
    public async getRecipientPage(req: Request, res: Response): Promise<void> {
        const pageNumber = req.query.page ? parseInt(req.query.page as string) : 1; // Получаем номер страницы из query параметра
        const pageSize = 50; // Размер страницы
        const offset = (pageNumber - 1) * pageSize;
        const searchTerm = req.query.search;

        const whereClause: any = {}; // Пустой объект для условий поиска

        if (searchTerm) {
            whereClause['name'] = {
                [Op.iLike]: `%${searchTerm}%`, // Используем оператор Op.iLike для регистронезависимого поиска похожих записей
            };
        }


        try {
            const totalCount = await Recipient.count({where: whereClause});
            const totalPages = Math.ceil(totalCount / pageSize);
            const results = await Recipient.findAll({
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


    public async getRecipients(req: Request, res: Response): Promise<void> {
        try {
            const column = req.query.column as string;
            const value = req.query.value as string;

            // Проверка наличия параметров запроса
            if (column && value) {
                const recipients = await Recipient.findAll({
                    where: {
                        [column]: {
                            [Op.like]: `%${value}%`, // Используйте нужный оператор сравнения
                        },
                    },
                });
                res.json(recipients);
            } else {
                const allRecipients = await Recipient.findAll();
                res.json(allRecipients);
            }
        } catch (error) {
            res.status(500).json({error: "Internal server error"});
        }
    }


    public async store(req: Request, res: Response): Promise<void> {
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
                    await RecipientsRegistriesRelation.create({
                        recipient_id: createdRecipient.id,
                        registry_id: registry_id,

                    }, {transaction: t});
                }
            }
            console.log('Record created.');

            await t.commit();

            res.json({message: 'Record created'});
        } catch (error) {
            console.error('Create operation failed:', error);
            await t.rollback();
            res.status(500).json({error: 'Create operation failed'});
        }
    }


    public async show(req: Request, res: Response): Promise<void> {
        const recipient_id = req.params.id;

        try {
            const recipient = await Recipient.findByPk(recipient_id);
            const recipientFiles = await RecipientsRegistriesRelation.findAll({
                where: {recipient_id: recipient_id},
            });

            if (!recipient) {
                res.status(404).json({error: "Recipient not found"});
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
            res.status(500).json({error: "Get by ID operation failed"});
        }
    }

    public async update(req: Request, res: Response): Promise<void> {
        const recipient_id = req.params.id;
        const filteredData: string[] = req.body.emails.filter((item: string) => item.trim() !== '');

        const emails: string = filteredData.join(', ');

        const {name, type, is_blocked, registry_ids} = req.body;
        try {

            const recipient = await Recipient.findByPk(recipient_id);
            if (!recipient) {
                res.status(404).json({error: "Recipient not found"});
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
                await RecipientsRegistriesRelation.destroy({
                    where: {
                        recipient_id: recipient.id,
                    },
                });

                // Create new relations
                for (const registry_id of registry_ids) {
                    await RecipientsRegistriesRelation.create({
                        recipient_id: recipient.id,
                        registry_id: registry_id,
                    });
                }
            }

            res.json(recipient);
        } catch (error) {
            console.error("Update operation failed:", error);
            res.status(500).json({error: "Update operation failed"});
        }
    }

    public async destroy(req: Request, res: Response): Promise<void> {
        const recipient_id = req.params.id;

        // Начинаем транзакцию
        const t = await sequelize.transaction();

        try {
            // Удаляем связанные записи из другой таблицы
            await RecipientsRegistriesRelation.destroy({
                where: {recipient_id: recipient_id},
                transaction: t
            });

            // Удаляем запись из таблицы Recipient
            const recipient = await Recipient.findByPk(recipient_id, {transaction: t});
            if (!recipient) {
                res.status(404).json({error: "Recipient not found"});
                return;
            }

            await recipient.destroy({transaction: t});

            // Фиксируем транзакцию
            await t.commit();

            res.json({message: "Recipient and related records deleted successfully"});
        } catch (error) {
            // Откатываем транзакцию в случае ошибки
            await t.rollback();

            console.error("Delete operation failed:", error);
            res.status(500).json({error: "Delete operation failed"});
        }
    }


}
