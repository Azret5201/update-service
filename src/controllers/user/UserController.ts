import { Request, Response } from 'express';
import { User } from '../../models/User';
import {checkHash, generateToken} from '../../utils/authUtils';
import {Role} from "../../models/Role";
import jwt from "jsonwebtoken";
import {sequelize} from "../../models";
import {RolePermissions} from "../../models/RolePermissions";
import {Permission} from "../../models/Permission";
import {checkPermission} from "../../utils/checkPermission";

export class UserController {
    public async login(req: Request, res: Response): Promise<void> {
        const {username, password} = req.body;
        if (!username || !password) {
            res.status(400).json({success: false, message: 'Отсутствуют обязательный поля'});
            return;
        }
        try {
            const user: any = await User.findOne({
                attributes: ['id', 'login', 'id_role', 'passwd', 'fio'],
                where: {login: username},
            });

            if (!user) {
                res.status(404).json({success: false, message: 'Пользователь не найден'});
                return;
            }

            const isPasswordValid = checkHash(user.passwd, password);
            if (!isPasswordValid) {
                res.status(400).json({success: false, message: 'Не правильный пароль'});
                return;
            }

            const role: any = await Role.findOne({
                attributes: ['id', 'name'],
                where: {id: user.id_role},
            });

            const token = generateToken(user.id);
            const decodedToken: any = jwt.verify(token, 'secret');
            let token_expires: any = null;

            if ("exp" in decodedToken) {
                token_expires = new Date(decodedToken.exp * 1000);
            }
            // Добавляем свойство role_name к объекту пользователя
            user.dataValues.role_name = role.name;

            res.status(200).json({success: true, user: user, accessToken: token, tokenExpires: token_expires});
        } catch (error) {
            console.error(error);
            res.status(500).json({success: false, message: 'Произошла ошибка при попытке входа ' + error});
        }

    }

    public async getPermissionsRoleByUserId(req: any, res: any): Promise<void> {
        console.log(req.body)
        const {userId, permissionName} = req.body;
        if (!userId || !permissionName) {
            res.status(400).json({success: false, message: 'Отсутствуют обязательные поля'});
            return;
        }
        try {
            const hasAccess: any = await checkPermission(userId, permissionName)

            if (hasAccess) {
                res.status(200).json({success: true, message: 'Разрешение не найдено'});
            } else {
                res.status(403).json({message: 'Доступ запрещён'});
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({success: false, message: 'Произошла ошибка при проверки доступа ' + error});
        }
    }
}
