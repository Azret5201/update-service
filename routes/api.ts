import express, { Request, Response } from 'express';
import { AbonentServiceController } from '../controllers/AbonentServiceController';

const app = express();
const port = 3000;

app.get('/api/listServices', AbonentServiceController.getServices);
app.get('/api/properties/:id', AbonentServiceController.getProperties);

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });
