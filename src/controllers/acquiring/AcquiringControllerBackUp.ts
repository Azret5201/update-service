import {Request, Response} from 'express';
import XLSX from 'xlsx';
import * as ExcelJS from 'exceljs';


const timeThreshold = 900;
const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const storage = multer.memoryStorage();
const upload = multer({storage: storage}).fields([{name: 'excelFile', maxCount: 1}, {name: 'textFile', maxCount: 1}]);

export class AcquiringController {
    public async comparison(req: Request, res: Response) {
        upload(req, res, (err: any) => {
            if (err) {
                return res.status(400).json({error: 'Error uploading files.'});
            }

            const files: { [fieldname: string]: Express.Multer.File[] } = req.files as any;
            const excelFiles = files['excelFile'];
            const textFiles = files['textFile'];

            console.log(req.files);

            if (!excelFiles || !textFiles || excelFiles.length === 0 || textFiles.length === 0) {
                return res.status(400).json({error: 'Excel and Text files are required.'});
            }

            const excelFile = excelFiles[0];
            const textFile = textFiles[0];

            try {
                const excelData = excelFile.buffer;
                const textData = textFile.buffer;
                // console.log(excelData);

                const dataFromExcel = readExcelFile(excelData);
                const dataFromTextFile = readTextFile(textData);

                const {
                    matchingData,
                    erroredDataExcel,
                    erroredDataText,
                } = compareData(dataFromExcel, dataFromTextFile);

                const outputExcelFile = createOutputExcelFile(
                    matchingData,
                    erroredDataExcel,
                    erroredDataText
                );

                res.status(200).json({success: true, outputExcelFile});
            } catch (error) {
                console.error('Error processing files:', error);
                res.status(500).json({error: 'Internal server error.'});
            }

        });
    }
}

function maskAccount(account: string): string {
    if (account) {
        return account.replace(/x/g, '*');
    }
    return '';
}

function readExcelFile(excelFileBuffer: Buffer) {
    const dataFromExcel: any = new Map();
    const workbook = XLSX.read(excelFileBuffer, {type: 'buffer'});
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: any = XLSX.utils.sheet_to_json(worksheet, {header: 1});

    for (let i = 1; i < rows.length - 1; i++) {
        const row = rows[i];
        const rowData = {
            Account: maskAccount(row[6]),
            Amount: parseInt(row[9], 10),
            Date: row[7],
        };
        dataFromExcel.set(rowData.Account, rowData);
    }

    return dataFromExcel;
}

function readTextFile(textFileBuffer: Buffer) {
    const dataFromTextFile: any = [];
    const textData = textFileBuffer.toString('utf-8');
    const textLines = textData.split('\n');

    if (textLines.length < 10) {
        console.error('Not enough lines in the text file');
        return dataFromTextFile;
    }

    for (let i = 7; i < textLines.length - 4; i++) {
        const values = textLines[i].split('|').map((value) => value.trim());
        const rowData = {
            Account: maskAccount(values[4]),
            Amount: parseInt(values[9], 10),
            Date: values[3],
        };

        dataFromTextFile.push(rowData);
    }

    return dataFromTextFile;
}


function compareData(dataFromExcel: any, dataFromTextFile: any) {
    const matchingData: any = [];
    const erroredDataExcel: any = [];
    const erroredDataText: any = [];

    if (dataFromExcel.size === 0 || dataFromTextFile.length === 0) {
        console.error('Данные не были загружены.');
        return {matchingData, erroredDataExcel, erroredDataText};
    }

    for (let i = 0; i < dataFromTextFile.length; i++) {
        const textRow: any = dataFromTextFile[i];
        console.log(`Сравниваем данные для строки ${i + 1}:`);
        console.log('Текстовый файл:', textRow);

        const matchingExcelRow = dataFromExcel.get(textRow.Account);

        if (matchingExcelRow) {
            console.log('Найдено совпадение в файле Excel:', matchingExcelRow);

            if (
                textRow.Amount === matchingExcelRow.Amount &&
                Math.abs(
                    new Date(textRow.Date).getTime() -
                    new Date(matchingExcelRow.Date).getTime()
                ) <= timeThreshold * 1000
            ) {
                console.log(`Совпадение в строке ${i + 1}:`);
                console.log(`  - Значение Amount из TXT: ${textRow.Amount}`);
                console.log(`  - Значение Amount из XLT: ${matchingExcelRow.Amount}`);
                console.log(`  - Значение Date из TXT: ${textRow.Date}`);
                console.log(`  - Значение Date из XLT: ${matchingExcelRow.Date}`);

                matchingData.push({Excel: matchingExcelRow, Text: textRow});

                dataFromExcel.delete(textRow.Account);
                dataFromTextFile.splice(i, 1);
                i--; // Уменьшаем счетчик, так как массив уменьшился после удаления элемента.
            }
        }
    }

    erroredDataExcel.push(...dataFromExcel.values());
    erroredDataText.push(...dataFromTextFile);

    // const errorExcelFileName = 'files/errorExcelData.json';
    // const errorTextFileName = 'files/errorTextData.json';
    // fs.writeFileSync(errorExcelFileName, JSON.stringify(erroredDataExcel, null, 2));
    // fs.writeFileSync(errorTextFileName, JSON.stringify(erroredDataText, null, 2));
    //
    // const matchingFileName = 'files/matchingData.json';
    // fs.writeFileSync(matchingFileName, JSON.stringify(matchingData, null, 2));

    console.log('Ошибочные данные из Excel:');
    console.log(JSON.stringify(erroredDataExcel, null, 2));
    console.log('Ошибочные данные из текстового файла:');
    console.log(JSON.stringify(erroredDataText, null, 2));

    return {matchingData, erroredDataExcel, erroredDataText};
}

function createOutputExcelFile(
    matchingData: any,
    erroredDataExcel: any,
    erroredDataText: any
) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data');

    worksheet.columns = [
        {header: 'Идентификатор Excel', key: 'excelAccount', width: 19},
        {header: 'Сумма Excel', key: 'excelAmount', width: 10},
        {header: 'Дата Excel', key: 'excelDate', width: 19},
        {header: '', key: 'spacer', width: 10},
        {header: 'Идентификатор Text', key: 'textAccount', width: 19},
        {header: 'Сумма Text', key: 'textAmount', width: 10},
        {header: 'Дата Text', key: 'textDate', width: 19},
    ];

    const setStyleForError = (cell: any) => {
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: {argb: 'FFFF0000'}, // Красный фон
        };
    };

    const setStyleForSuccess = (cell: any) => {
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: {argb: '228B22'}, // Зелёный фон
        };
    };

    erroredDataExcel.forEach((row: any) => {
        const rowValues = {
            excelAccount: row.Account,
            excelAmount: row.Amount,
            excelDate: row.Date,
            spacer: '',
        };
        setStyleForError(worksheet.addRow(rowValues).getCell('spacer'));
    });

    worksheet.addRow({});

    erroredDataText.forEach((row: any) => {
        const rowValues = {
            spacer: '',
            textAccount: row.Account,
            textAmount: row.Amount,
            textDate: row.Date,
        };
        setStyleForError(worksheet.addRow(rowValues).getCell('spacer'));
    });

    worksheet.addRow({});

    matchingData.forEach((match: any) => {
        const rowValues = {
            excelAccount: match.Excel.Account,
            excelAmount: match.Excel.Amount,
            excelDate: match.Excel.Date,
            spacer: '',
            textAccount: match.Text.Account,
            textAmount: match.Text.Amount,
            textDate: match.Text.Date,
        };
        setStyleForSuccess(worksheet.addRow(rowValues).getCell('spacer'));
    });

    const outputExcelFileName = 'files/output.xlsx';

    workbook.xlsx
        .writeFile(outputExcelFileName)
        .then(() => {
            console.log(`Создан итоговый Excel-файл: ${outputExcelFileName}`);
        })
        .catch((error) => {
            console.error('Ошибка при создании итогового Excel-файла:', error);
        });

    return outputExcelFileName;
}
