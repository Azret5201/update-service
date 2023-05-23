import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { UserController } from './controllers/UserController';
import { AuthMiddleware } from './middleware/AuthMiddleware';
import sequelize from './models/src/sequelize';

dotenv.config();

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.post('/login', UserController.login);
app.get('/users', AuthMiddleware.authenticate, UserController.getUsers);

app.get('/', (req, res) => {
  res.send('Express + TypeScript Server');
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
