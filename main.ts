import express from 'express';
import bodyParser from 'body-parser';
import router from './routes/api';
import cors from 'cors';


const app = express();
const port = 3000;

app.use(bodyParser.json({ limit: '50mb' }));

// Enable CORS for all routes
app.use(cors());
app.use('/api', router);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
