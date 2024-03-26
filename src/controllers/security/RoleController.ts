import {Request, Response} from "express";
import {RolePermissions} from "../../models/RolePermissions";
import {sequelize} from "../../models";
import {Registry} from "../../models/Registry";
import {Role} from "../../models/Role";
import {RecipientRegistry} from "../../models/RecipientRegistry";

export class RoleController {

    // public async store(req: Request, res: Response): Promise<void> {
    //     console.log(req.body)
    //     if (
    //         !req.body.name
    //         || !req.body.title
    //         || !req.body.description
    //     ) {
    //         res.status(400).json({success: false, message:  "Отсутствуют обязательные поля"});
    //         return;
    //     }
    //     const {name, title, description} = req.body;
    //
    //     try {
    //         await Role.create({
    //             name: name,
    //         });
    //
    //
    //         res.status(200).json({success: true, message: 'Получатель успешно создан'});
    //     } catch (error) {
    //         res.status(500).json({success: false, message: `Произошла ошибка при создании получателя \n ${error}`});
    //     }
    // }


    public async show(req: Request, res: Response): Promise<void> {
        const role_id = req.params.id;

        try {
            const role = await Role.findByPk(role_id);

            if (!role) {
                res.status(404).json({success: false, message:  "Роль не найдена"});
                return;
            }

            const permissions = await RolePermissions.findAll({
                attributes: ['permission_id'],
                where: {
                    role_id: role.id,
                },
            });

            const roleData = {
                id: role.id,
                name: role.name,
                permissions: permissions.map((permission) => ({
                    id: permission.permission_id,
                })),
            };
            res.json(roleData);
        } catch (error) {
            console.error("Get by ID operation failed:", error);
            res.status(500).json({success: false, message:  "Не удалось получить данные ", error});
        }
    }

    public async update(req: Request, res: Response): Promise<void> {
        if (
            !req.body.name
        ) {
            res.status(400).json({success: false, message:  "Отсутствуют обязательные поля"});
            return;
        }
        const role_id = req.params.id;

        const {name, permissions} = req.body;
        try {

            const role = await Role.findByPk(role_id);
            if (!role) {
                res.status(404).json({success: false, message:  "Роль не найдена"});
                return;

            }
                // Delete existing relations
                await RolePermissions.destroy({
                    where: {
                        role_id: role.id,
                    },
                });

                // Create new relations
                for (const permission_id of permissions) {
                    await RolePermissions.create({
                        role_id: role.id,
                        permission_id: permission_id,
                    });
                }
            role.name = name;

            await role.save();

            res.status(200).json({success: true, message: 'Роль успешно обновлёна'});
        } catch (error) {
            console.error("Update operation failed:", error);
            res.status(500).json({success: false, message:  "Не удалось обновить роль"});
        }
    }

    // public async destroy(req: Request, res: Response): Promise<void> {
    //     const role_id = req.params.id;
    //     // Начинаем транзакцию
    //     const t = await sequelize.transaction();
    //
    //     try {
    //
    //         // Удаляем запись из таблицы Role
    //         const role = await Role.findByPk(role_id, {transaction: t});
    //         if (!role) {
    //             res.status(404).json({success: false, message:  "Получатель не найден"});
    //             return;
    //         }
    //
    //         await role.destroy({transaction: t});
    //
    //         // Фиксируем транзакцию
    //         await t.commit();
    //
    //         res.status(200).json({success: true, message:  "Получатель успешно удалён"});
    //     } catch (error) {
    //         // Откатываем транзакцию в случае ошибки
    //         await t.rollback();
    //
    //         console.error("Delete operation failed:", error);
    //         res.status(500).json({success: false, message:  `Не удалось удалить получателя \n ${error}` });
    //     }
    // }


}
