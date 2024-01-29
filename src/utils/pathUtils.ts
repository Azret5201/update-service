import fs from 'fs';
import path from 'path';

require('dotenv').config();

const projectRoot: string = process.env.PROJECT_ROOT || '/home/quickpay/update-service';

export const getAbsolutePath = (...args: string[]): string => {
    const fullPath = path.join(projectRoot, ...args);

    // Создаем директорию, если она не существует
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, {recursive: true});
    }

    return fullPath;
};
