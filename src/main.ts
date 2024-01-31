import bodyParser from 'body-parser';
import router from './routes/api';
import cors from 'cors';

const express = require('express');


const port = process.env.PORT;


const app = express();
app.use(bodyParser.json({limit: '50mb'}));

// Enable CORS for all routes
app.use(cors());
app.use('/api', router);

app.listen(port, (err: any) => {
    if (err) {
        console.error(`[server]: Error starting server: ${err}`);
    } else {
        console.log(`[server]: Server is running at http://localhost:${port}`);
    }
});
