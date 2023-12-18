import fs from 'fs';
import path from 'path';

export const projectRoot = path.resolve(__dirname, '..');

export const getAbsolutePath = (...args: string[]): string => {
    const fullPath = path.join(projectRoot, ...args);

    // Создаем директорию, если она не существует
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }

    return fullPath;
};
