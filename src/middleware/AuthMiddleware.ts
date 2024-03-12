import {NextFunction, Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import {User} from '../models/User';

declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}

export class AuthMiddleware {
    public static authenticate(req: Request, res: Response, next: NextFunction) {

        try {
            let token = req.header('Authorization');
            if (!token) {
                throw new Error('Токен отсутствует');
            }
            token = token.split(' ')[1];
            const decodedToken: any = jwt.verify(token, 'secret');

            if (
                typeof decodedToken === 'object' &&
                new Date(decodedToken.exp * 1000).getTime() > Date.now() &&
                decodedToken.hasOwnProperty('userId')
            ) {
                const userId = (decodedToken as { userId: number }).userId;

                User.findByPk(userId, {
                    attributes: ['id', 'login', 'passwd'],
                }).then((user) => {
                    if (user) {
                        decodedToken.user = user.id;
                        next();
                    } else {
                        res.status(401).json({error: 'Unauthorized'});
                    }
                });
            } else {
                res.status(401).json({error: 'Unauthorized'});
            }
        } catch (error) {
            return res.status(500).json({success: false, message: 'Ошибка при проверки токена авторизации: ' + error});
        }
    }
}
