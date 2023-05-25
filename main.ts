import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { UserController } from './controllers/UserController';
import { AuthMiddleware } from './middleware/AuthMiddleware';
import sequelize from './models/src/sequelize';

import cors from 'cors';
import { AbonentServiceController } from './controllers/AbonentServiceController';

// Enable CORS for all routes
dotenv.config();

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

app.post('/login', UserController.login);
app.post('/abonent-service/store', AbonentServiceController.store);

app.get('/', (req, res) => {
  res.send('Express + TypeScript Server');
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
