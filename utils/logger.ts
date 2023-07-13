import fs from 'fs/promises';

type LogType = 'successful' | 'error';

export async function writeLogToFile(logType: LogType, message: string): Promise<void> {
  const fileName = logType === 'successful' ? 'successful.txt' : 'error.txt';
  const logMessage = `${new Date().toLocaleString()} - ${message}\n`;

  try {
    await fs.appendFile(fileName, logMessage);
  } catch (err) {
    console.error(`Failed to write log to ${fileName}: ${err}`);
  }
}
