import { Request, Response } from 'express';
import { User } from '../../models/User';
import {checkHash, generateToken} from '../../utils/authUtils';
import {Role} from "../../models/Role";

export class UserController {
    public async login(req: Request, res: Response): Promise<void> {
        const { username, password } = req.body;
        if (!username || !password) {
            res.status(400).json({success: false, message: 'Отсутствуют обязательный поля'});
            return;
        }
        try {
            const user:any = await User.findOne({
                attributes: ['id', 'login', 'id_role', 'passwd', 'fio'],
                where: { login: username },
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

            const role:any = await Role.findOne({
                attributes: ['id', 'name'], // Изменено на 'name', так как name используется внизу
                where: { id: user.id_role },
            });
            const token = generateToken(user.id);
            // Добавляем свойство role_name к объекту пользователя
            user.dataValues.role_name = role.name;

            // Отправляем пользовательские данные, включая имя роли, обратно клиенту
            res.status(200).json({success: true, user: user, accessToken: token});
        } catch (error) {
            console.error(error);
            res.status(500).json({success: false, message: 'Произошла ошибка при попытке входа ' + error});
        }

    }

    public async getUsers(req: Request, res: Response): Promise<void> {
        try {
            const users = await User.findAll();

            res.json(users);
        } catch (error) {
            res.status(500).json({success: false, message: 'Произошла ошибка при попытке получения пользователя ' + error});
        }
    }
}
