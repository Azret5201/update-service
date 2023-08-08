import * as fs from 'fs';

const logFilePath = 'script_log.log'; // Путь к файлу лога

export const log = (message: any) => {
    const logMessage = `${getCurrentTimestamp()} - ${message}\n`;
    process.stdout.write(logMessage); // Выводим лог в консоль
    fs.appendFile(logFilePath, logMessage, (err) => {
        if (err) {
            console.error('Error writing to log file:', err);
        }
    });
};

export const logError = (error: any) => {
    const errorMessage = `${getCurrentTimestamp()} - An error occurred: ${error.message}\n`;
    process.stderr.write(errorMessage); // Выводим ошибку в консоль
    fs.appendFile(logFilePath, errorMessage, (err) => {
        if (err) {
            console.error('Error writing error to log file:', err);
        }
    });
};

const getCurrentTimestamp = () => {
    const now = new Date();
    return now.toLocaleString(); // Возвращаем дату и время в формате "дд.мм.гггг, чч:мм:сс"
};
