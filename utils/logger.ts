import * as fs from 'fs';
import * as path from 'path';
import moment from "moment";
import {getAbsolutePath} from "./pathUtils";

const getCurrentTimestamp = () => {
    const now = new Date();
    return now.toLocaleString(); // Возвращаем дату и время в формате "дд.мм.гггг, чч:мм:сс"
};

// Путь к файлу лога (используйте абсолютный путь)
const logFilePath = path.join(getAbsolutePath('logs/registries/'), `${moment().format('YYYY-MM-DD')}_registries.log`);

export const log = (message: any) => {
    const logMessage = `${getCurrentTimestamp()} - ${message}\n`;
    process.stdout.write(logMessage); // Выводим лог в консоль

    // Проверяем существование каталога и создаем его при необходимости
    const logDirectory = path.dirname(logFilePath);
    if (!fs.existsSync(logDirectory)) {
        fs.mkdirSync(logDirectory, { recursive: true });
    }

    fs.appendFile(logFilePath, logMessage, (err) => {
        if (err) {
            console.error('Error writing to log file:', err);
        }
    });
};

export const logError = (error: any) => {
    const errorMessage = `${getCurrentTimestamp()} - [ERROR] ${error}\n`;
    process.stderr.write(errorMessage); // Выводим ошибку в консоль

    // Проверяем существование каталога и создаем его при необходимости
    const logDirectory = path.dirname(logFilePath);
    if (!fs.existsSync(logDirectory)) {
        fs.mkdirSync(logDirectory, { recursive: true });
    }

    fs.appendFile(logFilePath, errorMessage, (err) => {
        if (err) {
            console.error('Error writing error to log file:', err);
        }
    });
};

type LogType = 'successful' | 'error';

export async function writeLogToFile(logType: LogType, message: string): Promise<void> {
    const fileName = logType === 'successful' ? 'successful.txt' : 'error.txt';
    const logMessage = `${new Date().toLocaleString()} - ${message}\n`;

    try {
        const filePath = getAbsolutePath('logs/registries/') + fileName;
        // Проверяем существование каталога и создаем его при необходимости
        const logDirectory = path.dirname(filePath);
        if (!fs.existsSync(logDirectory)) {
            fs.mkdirSync(logDirectory, { recursive: true });
        }
        await fs.promises.appendFile(filePath, logMessage);
    } catch (err) {
        console.error(`Failed to write log to ${fileName}: ${err}`);
    }
}
