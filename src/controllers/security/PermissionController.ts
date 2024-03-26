import {Request, Response} from "express";
import {RolePermissions} from "../../models/RolePermissions";
import {sequelize} from "../../models";
import {Registry} from "../../models/Registry";
import {Permission} from "../../models/Permission";

export class PermissionController {

    public async store(req: Request, res: Response): Promise<void> {
        console.log(req.body)
        if (
            !req.body.name
            || !req.body.title
            || !req.body.description
        ) {
            res.status(400).json({success: false, message:  "Отсутствуют обязательные поля"});
            return;
        }
        const {name, title, description} = req.body;

        try {
            await Permission.create({
                name: name,
                title: title,
                description: description,
            });


            res.status(200).json({success: true, message: 'Разрешение успешно создано'});
        } catch (error) {
            res.status(500).json({success: false, message: `Произошла ошибка при создании разрешения \n ${error}`});
        }
    }


    public async show(req: Request, res: Response): Promise<void> {
        const permission_id = req.params.id;

        try {
            const permission = await Permission.findByPk(permission_id);

            if (!permission) {
                res.status(404).json({success: false, message:  "Разрешение не найдено"});
                return;
            }

            const permissionData = {
                id: permission.id,
                name: permission.name,
                title: permission.title,
                description: permission.description,
                createdAt: permission.createdAt,
                updatedAt: permission.updatedAt,
            };

            res.json(permissionData);
        } catch (error) {
            console.error("Get by ID operation failed:", error);
            res.status(500).json({success: false, message:  "Не удалось получить данные"});
        }
    }

    public async update(req: Request, res: Response): Promise<void> {
        if (
            !req.body.name
            || !req.body.title
            || !req.body.description
        ) {
            res.status(400).json({success: false, message:  "Отсутствуют обязательные поля"});
            return;
        }
        const permission_id = req.params.id;

        const {name, title, description} = req.body;
        try {

            const permission = await Permission.findByPk(permission_id);
            if (!permission) {
                res.status(404).json({success: false, message:  "Разрешение не найдено"});
                return;

            }

            permission.name = name;
            permission.title = title;
            permission.description = description;

            await permission.save();

            res.status(200).json({success: true, message: 'Разрешение успешно обновлёно', permission});
        } catch (error) {
            console.error("Update operation failed:", error);
            res.status(500).json({success: false, message:  "Не удалось обновить разрешение"});
        }
    }

    public async destroy(req: Request, res: Response): Promise<void> {
        const permission_id = req.params.id;
        // Начинаем транзакцию
        const t = await sequelize.transaction();

        try {
            // // Удаляем связанные записи из другой таблицы
            await RolePermissions.destroy({
                where: {id: permission_id},
                transaction: t
            });

            // Удаляем запись из таблицы Permission
            const permission = await Permission.findByPk(permission_id, {transaction: t});
            if (!permission) {
                res.status(404).json({success: false, message:  "Разрешение не найдено"});
                return;
            }

            await permission.destroy({transaction: t});

            // Фиксируем транзакцию
            await t.commit();

            res.status(200).json({success: true, message:  "Разрешение успешно удалёно"});
        } catch (error) {
            // Откатываем транзакцию в случае ошибки
            await t.rollback();

            console.error("Delete operation failed:", error);
            res.status(500).json({success: false, message:  `Не удалось удалить разрешение \n ${error}` });
        }
    }


}
