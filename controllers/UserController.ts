import { Request, Response } from 'express';
import { User } from '../models/src/models/User';
import { checkHash, generateToken } from '../utils/authUtils';

export class UserController {
  public async login(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body;

    try {
      const user = await User.findOne({
        attributes: ['id', 'login', 'passwd'],
        where: { login: username },
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      const isPasswordValid = checkHash(user.passwd, password);

      if (!isPasswordValid) {
        res.status(401).json({ error: 'Invalid password' });
        return;
      }

      const token = generateToken(user.id);

      res.json({ token });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  public async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await User.findAll();

      res.json(users);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
