import bodyParser from 'body-parser';
import router from './routes/api';
import cors from 'cors';
import {sequelize} from "./models";

const express = require('express');


const port = process.env.PORT;


const app = express();
app.use(bodyParser.json({limit: '50mb'}));

// Enable CORS for all routes
app.use(cors());
app.use('/api', router);

sequelize.sync().then(() => {
    app.listen(port, () => {
        console.log(`App is running on http://localhost:${port}`);
    });
}).catch(error => {
    console.error('Ошибка синхронизации базы данных:', error);
});
