import {Request, Response} from 'express';
import fs from 'fs';
import ExcelJS from 'exceljs'; // Импорт библиотеки exceljs
import {getDataForReport} from "../../../services/dealer/reports/getDataForReport";
import {getAbsolutePath} from "../../../utils/pathUtils";

export class ExportReportController {

    public async createReport(req: Request, res: Response) {
        const formData = req.body.formData;
        const startDate = formData.startDate;
        const endDate = formData.endDate;

        if (!startDate && !endDate) {
            res.status(500).json({
                success: false,
                message: 'Не выбран период отправки'
            });
            return;
        }

        // Создайте новую рабочую книгу Excel и лист
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Report');


        // Заголовки столбцов
        worksheet.columns = [
            {header: 'Дата', key: 'date', width: 13},
            {header: 'Код дилера', key: 'dealer_id', width: 13},
            {header: 'Дилер', key: 'dealer_name', width: 35},
            {header: 'Код договора', key: 'dealer_dogovor', width: 13},
            {header: 'Код поставщика', key: 'bill_server_id', width: 16},
            {header: 'Поставщик', key: 'bill_server_name', width: 25},
            {header: 'Код договора', key: 'bill_server_dogovor', width: 13},
            {header: 'Сумма', key: 'real_pay', width: 10},
            {header: 'Дилер ТСЖ', key: 'dealer_name_tsj', width: 35},
        ];


        try {
            // Используйте await перед вызовом getDataForReport
            const reportData: any = await getDataForReport(startDate, endDate);

            reportData.forEach((row: any) => {
                worksheet.addRow(row);
            });

            // Сохранение книги Excel в файл
            const filePath = getAbsolutePath('storage/dealer/reports/') + 'report.xlsx';
            await workbook.xlsx.writeFile(filePath);

            // Отправка файла клиенту
            res.sendFile(filePath, async (err) => {
                try {
                    await fs.promises.unlink(filePath);
                } catch (error) {
                    console.error('Ошибка при удалении файла:', error);
                }
                if (err) {
                    console.error('Ошибка при скачивании файла:', err);
                    res.status(500).send('Ошибка при скачивании файла');
                }
            });
        } catch (error) {
            console.error('Ошибка при получении данных для отчета:', error);
            res.status(500).json({success: false, message: 'Ошибка при получении данных для отчета, ' + error});
        }
        console.log('script complete')
    }
}
