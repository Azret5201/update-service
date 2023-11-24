// const fs = require('fs');
// const XLSX = require('xlsjs');
// const ExcelJS = require('exceljs');
//
// const excelFileName = './test/lk.xlt';
// const textFileName = './test/reesrt.txt';
// const errorExcelFileName = './test/errors_excel.txt'; // Файл для ошибочных записей из Excel
// const errorTextFileName = './test/errors_text.txt';   // Файл для ошибочных записей из текстового файла
// const matchingFileName = './test/matching.txt';       // Файл для совпадающих записей
// const logFileName = './test/log.txt';                 // Файл для записи логов
// const outputExcelFileName = './test/output.xlsx';     // Файл для создания итогового Excel-файла
//
// const dataFromExcel = new Map();
// const dataFromTextFile = [];
// const erroredDataExcel = [];
// const erroredDataText = [];
// const matchingData = [];
//
// // const logStream = fs.createWriteStream(logFileName, { flags: 'a' });
// const timeThreshold = 900;
// // console.log = (message) => {
// //     logStream.write(`${message}\n`);
// //     process.stdout.write(`${message}\n`);
// // };
//
// const maskAccount = (account) => {
//     if (account) {
//         return account.replace(/x/g, '*');
//     }
//     return '';
// };
//
// const readExcelFile = () => {
//     try {
//         const workbook = XLSX.readFile(excelFileName);
//         const worksheet = workbook.Sheets[workbook.SheetNames[0]];
//         const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
//
//         for (let i = 1; i < rows.length - 1; i++) {
//             const row = rows[i];
//             const rowData = {
//                 Account: maskAccount(row[6]), // Маскируем идентификатор
//                 Amount: parseInt(row[9], 10),
//                 Date: row[7],
//             };
//             dataFromExcel.set(rowData.Account, rowData);
//         }
//     } catch (error) {
//         console.error('Ошибка при чтении файла Excel:', error.message);
//         throw error;
//     }
// };
//
// const readTextFile = () => {
//     try {
//         const textData = fs.readFileSync(textFileName, 'utf-8');
//         const textLines = textData.split('\n');
//
//         if (textLines.length < 10) {
//             console.error('Недостаточно строк в текстовом файле');
//             return;
//         }
//
//         const headers = textLines[10].split('|').map((header) => header.trim());
//
//         for (let i = 7; i < textLines.length - 4; i++) {
//             const values = textLines[i].split('|').map((value) => value.trim());
//             const rowData = {
//                 Account: maskAccount(values[4]), // Маскируем идентификатор
//                 Amount: parseInt(values[9], 10),
//                 Date: values[3],
//                 // Добавьте остальные поля
//             };
//
//             dataFromTextFile.push(rowData);
//         }
//     } catch (error) {
//         console.error('Ошибка при чтении текстового файла:', error.message);
//         throw error;
//     }
// };
//
// const compareData = () => {
//     if (dataFromExcel.size === 0 || dataFromTextFile.length === 0) {
//         console.error('Данные не были загружены.');
//         return;
//     }
//
//     for (let i = 0; i < dataFromTextFile.length; i++) {
//         const textRow = dataFromTextFile[i];
//         console.log(`Сравниваем данные для строки ${i + 1}:`);
//         console.log('Текстовый файл:', textRow);
//
//         const matchingExcelRow = dataFromExcel.get(textRow.Account);
//
//         if (matchingExcelRow) {
//             console.log('Найдено совпадение в файле Excel:', matchingExcelRow);
//
//             if (
//                 textRow.Amount === matchingExcelRow.Amount &&
//                 Math.abs(new Date(textRow.Date) - new Date(matchingExcelRow.Date)) <= timeThreshold * 1000
//             ) {
//                 console.log(`Совпадение в строке ${i + 1}:`);
//                 console.log(`  - Значение Amount из TXT: ${textRow.Amount}`);
//                 console.log(`  - Значение Amount из XLT: ${matchingExcelRow.Amount}`);
//                 console.log(`  - Значение Date из TXT: ${textRow.Date}`);
//                 console.log(`  - Значение Date из XLT: ${matchingExcelRow.Date}`);
//
//                 matchingData.push({ Excel: matchingExcelRow, Text: textRow });
//
//                 dataFromExcel.delete(textRow.Account);
//                 dataFromTextFile.splice(i, 1);
//                 i--; // Уменьшаем счетчик, так как массив уменьшился после удаления элемента.
//             }
//         }
//     }
//
//     erroredDataExcel.push(...dataFromExcel.values());
//     erroredDataText.push(...dataFromTextFile);
//
//     fs.writeFileSync(errorExcelFileName, JSON.stringify(erroredDataExcel, null, 2));
//     fs.writeFileSync(errorTextFileName, JSON.stringify(erroredDataText, null, 2));
//
//     fs.writeFileSync(matchingFileName, JSON.stringify(matchingData, null, 2));
//
//     console.log('Ошибочные данные из Excel:');
//     console.log(JSON.stringify(erroredDataExcel, null, 2));
//     console.log('Ошибочные данные из текстового файла:');
//     console.log(JSON.stringify(erroredDataText, null, 2));
//
//     createOutputExcelFile(matchingData, erroredDataExcel, erroredDataText, outputExcelFileName);
// };
//
// const createOutputExcelFile = (matchingData, erroredDataExcel, erroredDataText, outputExcelFileName) => {
//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet('Data');
//
//     worksheet.columns = [
//         { header: 'Идентификатор Excel', key: 'excelAccount', width: 19 },
//         { header: 'Сумма Excel', key: 'excelAmount', width: 10 },
//         { header: 'Дата Excel', key: 'excelDate', width: 19 },
//         { header: '', key: 'spacer', width: 10 },
//         { header: 'Идентификатор Text', key: 'textAccount', width: 19 },
//         { header: 'Сумма Text', key: 'textAmount', width: 10 },
//         { header: 'Дата Text', key: 'textDate', width: 19 },
//     ];
//
//     // Функция для установки стиля ошибочных данных
//     const setStyleForError = (cell) => {
//         cell.fill = {
//             type: 'pattern',
//             pattern: 'solid',
//             fgColor: { argb: 'FFFF0000' }, // Красный фон
//         };
//     };
//     const setStyleForSuccess = (cell) => {
//         cell.fill = {
//             type: 'pattern',
//             pattern: 'solid',
//             fgColor: { argb: '228B22' }, // Зелёный фон
//         };
//     };
//
//     erroredDataExcel.forEach((row) => {
//         const rowValues = {
//             excelAccount: row.Account,
//             excelAmount: row.Amount,
//             excelDate: row.Date,
//             spacer: '',
//         };
//         // Устанавливаем стиль для ошибочных данных
//         setStyleForError(worksheet.addRow(rowValues).getCell('spacer'));
//     });
//
//     worksheet.addRow({}); // Add another empty row as a separator.
//
//     erroredDataText.forEach((row) => {
//         const rowValues = {
//             spacer: '',
//             textAccount: row.Account,
//             textAmount: row.Amount,
//             textDate: row.Date,
//         };
//         // Устанавливаем стиль для ошибочных данных
//         setStyleForError(worksheet.addRow(rowValues).getCell('spacer'));
//     });
//
//     worksheet.addRow({}); // Add an empty row as a separator.
//
//     matchingData.forEach((match) => {
//         const rowValues ={
//             excelAccount: match.Excel.Account,
//             excelAmount: match.Excel.Amount,
//             excelDate: match.Excel.Date,
//             spacer: '',
//             textAccount: match.Text.Account,
//             textAmount: match.Text.Amount,
//             textDate: match.Text.Date,
//         };
//         setStyleForSuccess(worksheet.addRow(rowValues).getCell('spacer'));
//     });
//
//     workbook.xlsx.writeFile(outputExcelFileName)
//         .then(() => {
//             console.log(`Создан итоговый Excel-файл: ${outputExcelFileName}`);
//         })
//         .catch(error => {
//             console.error('Ошибка при создании итогового Excel-файла:', error);
//         });
// };
//
// (() => {
//     try {
//         readExcelFile();
//         readTextFile();
//         compareData();
//     } catch (error) {
//         console.error('Ошибка:', error.message);
//     }
// })();
