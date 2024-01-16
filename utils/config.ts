import * as dotenv from 'dotenv';
import {getAbsolutePath} from "./pathUtils";

let envFilePath = getAbsolutePath('.env.dev');
if (process.env.NODE_ENV === 'production') {
    envFilePath = getAbsolutePath('.env.prod');
}

dotenv.config({path: envFilePath});

export const config = {
    dbPort: process.env.DB_PORT || '',
    dbHost: process.env.DB_HOST || '',
    dbUser: process.env.DB_USERNAME || '',
    dbPassword: process.env.DB_PASSWORD || '',
    dbName: process.env.DB_NAME || '',
    dbDialect: process.env.DB_DIALECT || 'postgres',
};
