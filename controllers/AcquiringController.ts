// import { Request, Response } from 'express';
// import fs from 'fs';
// import path from 'path';
// import XLSX from 'xlsx';
// import ExcelJS from 'exceljs';
// const timeThreshold = 900;
// const express = require('express');
// const multer = require('multer');
// const bodyParser = require('body-parser');
//
// const app = express();
// app.use(bodyParser.json());
//
// const storage = multer.memoryStorage(); // Используйте in-memory storage
// const upload = multer({ storage: storage });
//
//
// export class AcquiringController {
//     public async comparison(req: Request, res: Response) {
//         // console.log('aaaaaa', req.file )
//         if (!req.body || !req.body.excelFile || !req.body.textFile) {
//             return res.status(400).json({ error: 'Excel and Text body are required.' });
//         }
//         const excelFile = req.body.excelFile[0]; // Файл Excel
//         const textFile = req.body.textFile[0]; // Текстовый файл
//
//
//         // Здесь вы можете выполнить необходимую обработку excelFile и textFile
//
//         try {
//             const excelFileName = excelFile.originalname; // Имя файла Excel
//             const textFileName = textFile.originalname; // Имя текстового файла
//
//             const excelData = readExcelFile(excelFile.buffer);
//             const textData = readTextFile(textFile.buffer);
//
//             const { matchingData, erroredDataExcel, erroredDataText } = compareData(excelData, textData);
//
//             const outputExcelFile = await createOutputExcelFile(matchingData, erroredDataExcel, erroredDataText);
//
//             res.json({ outputExcelFile });
//         } catch (error) {
//             console.error(error);
//             res.status(500).json({ error: "Internal server error" });
//         }
//     }
// }
//
//
//     function maskAccount(account: string): string {
//         if (account) {
//             return account.replace(/x/g, '*');
//         }
//         return '';
//     }
//
//     function  readExcelFile(excelFilePath: string) {
//         const dataFromExcel: any = new Map();
//
//         try {
//             const workbook = XLSX.readFile(excelFilePath);
//             const worksheet = workbook.Sheets[workbook.SheetNames[0]];
//             const rows: any = XLSX.utils.sheet_to_json(worksheet, {header: 1});
//
//             for (let i = 1; i < rows.length - 1; i++) {
//                 const row = rows[i];
//                 const rowData = {
//                     Account: maskAccount(row[6]), // Маскируем идентификатор
//                     Amount: parseInt(row[9], 10),
//                     Date: row[7],
//                 };
//                 dataFromExcel.set(rowData.Account, rowData);
//             }
//         } catch (error: any) {
//             console.error('Ошибка при чтении файла Excel:', error.message);
//             throw error;
//         }
//
//         return dataFromExcel;
//     }
//
//     function readTextFile(textFilePath: string) {
//         const dataFromTextFile: any = [];
//
//         try {
//             const textData = fs.readFileSync(textFilePath, 'utf-8');
//             const textLines = textData.split('\n');
//
//             if (textLines.length < 10) {
//                 console.error('Недостаточно строк в текстовом файле');
//                 return dataFromTextFile;
//             }
//
//             for (let i = 7; i < textLines.length - 4; i++) {
//                 const values = textLines[i].split('|').map((value) => value.trim());
//                 const rowData = {
//                     Account: maskAccount(values[4]), // Маскируем идентификатор
//                     Amount: parseInt(values[9], 10),
//                     Date: values[3],
//                     // Добавьте остальные поля
//                 };
//
//                 dataFromTextFile.push(rowData);
//             }
//         } catch (error: any) {
//             console.error('Ошибка при чтении текстового файла:', error.message);
//             throw error;
//         }
//
//         return dataFromTextFile;
//     }
//
//     function compareData(dataFromExcel: any, dataFromTextFile: any) {
//         const matchingData: any = [];
//         const erroredDataExcel: any = [];
//         const erroredDataText: any = [];
//
//         if (dataFromExcel.size === 0 || dataFromTextFile.length === 0) {
//             console.error('Данные не были загружены.');
//             return {matchingData, erroredDataExcel, erroredDataText};
//         }
//
//         // Здесь вам также нужно объявить переменную timeThreshold
//
//         for (let i = 0; i < dataFromTextFile.length; i++) {
//             const textRow: any = dataFromTextFile[i];
//             console.log(`Сравниваем данные для строки ${i + 1}:`);
//             console.log('Текстовый файл:', textRow);
//
//             const matchingExcelRow = dataFromExcel.get(textRow.Account);
//
//             if (matchingExcelRow) {
//                 console.log('Найдено совпадение в файле Excel:', matchingExcelRow);
//
//                 if (
//                     textRow.Amount === matchingExcelRow.Amount &&
//                     Math.abs(new Date(textRow.Date).getTime() - new Date(matchingExcelRow.Date).getTime()) <= timeThreshold * 1000
//                 ) {
//                     console.log(`Совпадение в строке ${i + 1}:`);
//                     console.log(`  - Значение Amount из TXT: ${textRow.Amount}`);
//                     console.log(`  - Значение Amount из XLT: ${matchingExcelRow.Amount}`);
//                     console.log(`  - Значение Date из TXT: ${textRow.Date}`);
//                     console.log(`  - Значение Date из XLT: ${matchingExcelRow.Date}`);
//
//                     matchingData.push({Excel: matchingExcelRow, Text: textRow});
//
//                     dataFromExcel.delete(textRow.Account);
//                     dataFromTextFile.splice(i, 1);
//                     i--; // Уменьшаем счетчик, так как массив уменьшился после удаления элемента.
//                 }
//             }
//         }
//
//         erroredDataExcel.push(...dataFromExcel.values());
//         erroredDataText.push(...dataFromTextFile);
//
//         // Здесь также нужно объявить переменные errorExcelFileName и errorTextFileName
//
//         const errorExcelFileName = 'errorExcelData.json';
//         const errorTextFileName = 'errorTextData.json';
//         fs.writeFileSync(errorExcelFileName, JSON.stringify(erroredDataExcel, null, 2));
//         fs.writeFileSync(errorTextFileName, JSON.stringify(erroredDataText, null, 2));
//
//         // Здесь также нужно объявить переменную matchingFileName
//
//         const matchingFileName = 'matchingData.json';
//         fs.writeFileSync(matchingFileName, JSON.stringify(matchingData, null, 2));
//
//         console.log('Ошибочные данные из Excel:');
//         console.log(JSON.stringify(erroredDataExcel, null, 2));
//         console.log('Ошибочные данные из текстового файла:');
//         console.log(JSON.stringify(erroredDataText, null, 2));
//
//         return {matchingData, erroredDataExcel, erroredDataText};
//     }
//
//     function createOutputExcelFile(matchingData: any, erroredDataExcel: any, erroredDataText: any) {
//         const workbook = new ExcelJS.Workbook();
//         const worksheet = workbook.addWorksheet('Data');
//
//         worksheet.columns = [
//             {header: 'Идентификатор Excel', key: 'excelAccount', width: 19},
//             {header: 'Сумма Excel', key: 'excelAmount', width: 10},
//             {header: 'Дата Excel', key: 'excelDate', width: 19},
//             {header: '', key: 'spacer', width: 10},
//             {header: 'Идентификатор Text', key: 'textAccount', width: 19},
//             {header: 'Сумма Text', key: 'textAmount', width: 10},
//             {header: 'Дата Text', key: 'textDate', width: 19},
//         ];
//
//         // Функция для установки стиля ошибочных данных
//         const setStyleForError = (cell: any) => {
//             cell.fill = {
//                 type: 'pattern',
//                 pattern: 'solid',
//                 fgColor: {argb: 'FFFF0000'}, // Красный фон
//             };
//         };
//         const setStyleForSuccess = (cell: any) => {
//             cell.fill = {
//                 type: 'pattern',
//                 pattern: 'solid',
//                 fgColor: {argb: '228B22'}, // Зелёный фон
//             };
//
//             erroredDataExcel.forEach((row: any) => {
//                 const rowValues = {
//                     excelAccount: row.Account,
//                     excelAmount: row.Amount,
//                     excelDate: row.Date,
//                     spacer: '',
//                 };
//                 // Устанавливаем стиль для ошибочных данных
//                 setStyleForError(worksheet.addRow(rowValues).getCell('spacer'));
//             });
//
//             worksheet.addRow({}); // Add another empty row as a separator.
//
//             erroredDataText.forEach((row: any) => {
//                 const rowValues = {
//                     spacer: '',
//                     textAccount: row.Account,
//                     textAmount: row.Amount,
//                     textDate: row.Date,
//                 };
//                 // Устанавливаем стиль для ошибочных данных
//                 setStyleForError(worksheet.addRow(rowValues).getCell('spacer'));
//             });
//
//             worksheet.addRow({}); // Add an empty row as a separator.
//
//             matchingData.forEach((match: any) => {
//                 const rowValues = {
//                     excelAccount: match.Excel.Account,
//                     excelAmount: match.Excel.Amount,
//                     excelDate: match.Excel.Date,
//                     spacer: '',
//                     textAccount: match.Text.Account,
//                     textAmount: match.Text.Amount,
//                     textDate: match.Text.Date,
//                 };
//                 setStyleForSuccess(worksheet.addRow(rowValues).getCell('spacer'));
//             })
//
//             // Здесь также нужно объявить переменную outputExcelFileName
//
//             const outputExcelFileName = 'output.xlsx';
//
//             workbook.xlsx.writeFile(outputExcelFileName)
//                 .then(() => {
//                     console.log(`Создан итоговый Excel-файл: ${outputExcelFileName}`);
//                 })
//                 .catch(error => {
//                     console.error('Ошибка при создании итогового Excel-файла:', error);
//                 });
//
//             return outputExcelFileName;
//         }
//
//         // function calculateStatistics(excelData, textData) {
//         //     // Расчет статистики (подсчет ошибочных и успешных платежей и др.)
//         // }
// }