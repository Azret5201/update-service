import fs from 'fs';
import path from 'path';

const projectRoot:any = process.env.PROJECT_ROOT;

export const getAbsolutePath = (...args: string[]): string => {
    const fullPath = path.join(projectRoot, ...args);
    console.log('aaaaaaaaaaaaaaaaaaaaa', fullPath)

    // Создаем директорию, если она не существует
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }

    return fullPath;
};
