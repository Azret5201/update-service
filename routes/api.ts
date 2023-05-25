import express, { Request, Response } from 'express';
import { AbonentServiceController } from '../controllers/AbonentServiceController';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { UserController } from '../controllers/UserController';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import cors from 'cors';

// Enable CORS for all routes
dotenv.config();

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

app.post('/login', UserController.login);
app.get('/users', AuthMiddleware.authenticate, UserController.getUsers);

app.get('/', (req, res) => {
  res.send('Express + TypeScript Server');
});

app.get('/api/listServices', AbonentServiceController.getServices);
app.get('/api/properties/:id', AbonentServiceController.getProperties);

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });
