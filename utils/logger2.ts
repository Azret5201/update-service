import * as fs from 'fs';
import * as path from 'path';
import moment from 'moment';
import { getAbsolutePath } from './pathUtils';

export class Logger {
  private logFilePath: string;

  constructor(logType: string) {
    this.logFilePath = this.createLogFilePath(logType);
  }

  private getCurrentTimestamp(): string {
    const now = new Date();
    return now.toLocaleString();
  }

  private createLogFilePath(logType: string): string {
    const logFileName = `${moment().format('YYYY-MM-DD')}_${logType}.log`;
    return path.join(getAbsolutePath('logs', logType), logFileName);
  }

  private ensureLogDirectoryExists(): void {
    const logDirectory = path.dirname(this.logFilePath);
    if (!fs.existsSync(logDirectory)) {
      fs.mkdirSync(logDirectory, { recursive: true });
    }
  }

  private async appendToFile(logMessage: string): Promise<void> {
    try {
      await fs.promises.appendFile(this.logFilePath, logMessage);
    } catch (err) {
      console.error(`Failed to write log to ${this.logFilePath}: ${err}`);
    }
  }

  public log(message: string): void {
    const logMessage = `${this.getCurrentTimestamp()} - ${message}\n`;
    process.stdout.write(logMessage);
    this.ensureLogDirectoryExists();
    this.appendToFile(logMessage);
  }

  public logError(error: any): void {
    const errorMessage = `${this.getCurrentTimestamp()} - [ERROR] ${error}\n`;
    process.stderr.write(errorMessage);
    this.ensureLogDirectoryExists();
    this.appendToFile(errorMessage);
  }

}
