import { Request, Response, NextFunction } from 'express';
import jwt from "jsonwebtoken";
import { UserController } from "../controllers/user/UserController";
import {checkPermission} from "../utils/checkPermission";

export class PermissionMiddleware {
    static checkPermission(permission: string) {
        return async (req: any, res: Response, next: NextFunction) => {
            let token = req.header('Authorization');
            if (!token) {
                return res.status(403).json({ error: 'Токен отсутствует' });
            }
            token = token.split(' ')[1];
            const decodedToken: any = jwt.verify(token, 'secret');

            // Проверяем, есть ли пользователь и разрешения
            if (!decodedToken || !decodedToken.userId || !permission) {
                return res.status(403).json({ error: 'Данные не найдены. Доступ запрещён.' });
            }

            try {
                // Получаем разрешения пользователя по его ID, передавая req.body
                const hasAccess: any = await checkPermission(decodedToken.userId, permission)
                if (hasAccess) {
                    next(); // Пропускаем запрос дальше
                } else {
                    res.status(403).json({ message: 'Доступ запрещён' });
                }
            } catch (error) {
                // Обрабатываем ошибку запроса к базе данных
                console.error('Error while fetching user permissions:', error);
                next(error); // Передаем ошибку через next
            }
        };
    }
}
