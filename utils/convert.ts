import XLSX from 'xlsx';
import fs, { PathLike } from 'fs';
import { basename, extname } from 'path';

interface Convertor {
  sourseFilePath: string;
  outputFileDirectoryPath?: string;
  fileToCsv(): void;
}

class XlsxConvertor implements Convertor {
  sourseFilePath: string;
  outputFileDirectoryPath: string;

  constructor(sourseFilePath: PathLike, outputFileDirectoryPath?: PathLike) {
    this.sourseFilePath = sourseFilePath.toString();
    if (outputFileDirectoryPath) {
      this.outputFileDirectoryPath = outputFileDirectoryPath.toString();
    }
    this.outputFileDirectoryPath = './filtered/';
  }

  fileToCsv(): void {
    try {
      const fileName = basename(this.sourseFilePath, extname(this.sourseFilePath));

      const workbook = XLSX.readFile(this.sourseFilePath.toString());
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const csvData = XLSX.utils.sheet_to_csv(sheet);
      fs.writeFileSync(this.outputFileDirectoryPath + fileName + '.csv', csvData, 'utf8');
    } catch (error) {
      new Error('Bad convert');
    }
  }
}

const excel = new XlsxConvertor('17.05.xlsx');
excel.fileToCsv();
