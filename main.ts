import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import router from './routes/api';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Enable CORS for all routes
app.use(cors());
app.use(router);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
