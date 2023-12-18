import fs from 'fs';
import path from 'path';

const projectRoot:string = process.env.PROJECT_ROOT || __dirname;

export const getAbsolutePath = (...args: string[]): string => {
    const fullPath = path.join(projectRoot, ...args);

    // Создаем директорию, если она не существует
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }

    return fullPath;
};
