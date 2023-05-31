import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/src/models/User';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export class AuthMiddleware {
  public static authenticate(req: Request, res: Response, next: NextFunction): void {
    let token = req.header('Authorization');

    if (!token) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    token = token.split(' ')[1];
    try {
      const decoded = jwt.verify(token, 'secret');

      if (typeof decoded === 'object' && decoded.hasOwnProperty('userId')) {
        const userId = (decoded as { userId: number }).userId;

        User.findByPk(userId, {
          attributes: ['id', 'login', 'passwd'],
        }).then((user) => {
          if (user) {
            decoded.user = user.id;
            next();
          } else {
            res.status(401).json({ error: 'Unauthorized' });
          }
        });
      } else {
        res.status(401).json({ error: 'Unauthorized' });
      }
    } catch (error) {
      res.status(401).json({ error: 'Unauthorized' });
    }
  }
}
