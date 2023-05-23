import express, { Request, Response } from 'express';
import { ServiceController } from '../controllers/ServiceController';
import { UserController } from '../controllers/UserController';

const app = express();
const port = 3000;

app.get('/api/data', UserController.getUsers);

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });
