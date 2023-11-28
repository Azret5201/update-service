import * as xlsx from "xlsx";
import { promisify } from "util";
import * as fs from "fs";
import {
    addOrderLimitOffset,
    fetchDataFromDatabase,
    generateSQLQuery,
} from "./getDataForRegistory";
import { getAccountValueByKey } from "../../utils/account2str";
import { Payment } from "../../models/src/models/Payment";
import { Op } from "sequelize";

interface ExcelData {
    id: string;
    [key: string]: any;
}

export const createExcelFile = async (
    serverId: string,
    serviceId: string,
    data: any[],
    outputPath: string,
    type: number,
    batchSize: number
): Promise<void> => {
    const columns = data[0].table_headers.split(", ");
    new Set<string>();
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.aoa_to_sheet([columns]);

    const { fields, startDate, endDate, paymentsList } = data[0];

    let paymentIds: string[] = [];


    // if (paymentsList && paymentsList.length > 0) {
    //     const filteredPayments = paymentsList.filter(
    //         (payment: any) => payment.id_service === serviceId
    //     );
    //     paymentIds = filteredPayments.map((payment: any) => payment.id);
    // }
    // const payments = await Payment.findAll({
    //     where: {
    //         id: {
    //             [Op.in]: paymentIds,
    //         },
    //     },
    // });

    const registryFields = fields.split(", ");
    const hasIdColumn = /\b(id)\b/.test(fields);
    const fieldArray = hasIdColumn ? registryFields.join(", ") : ["id", ...registryFields];

    let batchIndex = 0;
    let offset = 0;
    let allData: ExcelData[] = [];

    // Функция для удаления ненужных ключей из объекта
    const removeNonMatchingKeys = (payment: any) => {
        const plainPayment = payment.get({ plain: true });
        const isFieldValid = (field: string) =>
            fieldArray.includes(field) ||
            (field.startsWith("account") &&
                fieldArray.some((item: any) => item.startsWith("account.")));

        Object.keys(plainPayment).forEach((field) => {
            if (!isFieldValid(field)) {
                delete plainPayment[field];
            }
        });

        return plainPayment;
    };

    // Удаляем ненужные ключи из каждого объекта в массиве payments
    // const paymentsWithSelectedKeys: ExcelData[] = payments.map(removeNonMatchingKeys);

    async function processDataChunk(dataFromDB: any[]) {
        const uniqueIds = new Set<string>();
        const uniqueDataFromDB = [...dataFromDB].filter((item) => {
            if (uniqueIds.has(item.id)) {
                return false; // Пропускаем запись, если у нас уже есть такой идентификатор
            }
            uniqueIds.add(item.id);
            return true; // Оставляем только уникальные записи
        });

        // Обработка данных из массива account
        if (fields.includes("account")) {
            const match = fields.match(/account\.(.+)/);
            const accountKey = match ? match[1] : null;

            if (accountKey) {
                uniqueDataFromDB.forEach((row: ExcelData) => {
                    if (Array.isArray(row.account)) {
                        const accountValues: { [key: string]: any } = {};

                        row.account.forEach(([k, v]: [string, any]) => {
                            if (k !== undefined && k !== null) {
                                accountValues[k] = v;
                            }
                        });

                        // Добавляем значения из accountValues в row
                        Object.assign(row, accountValues);

                        // Добавляем account как отдельное поле в dataFromDB
                        row.account = accountValues;
                    }
                });
            }
        }

        const cleanedFields = registryFields.map((field: string) =>
            field.replace(/^account\./, "")
        );

        const filteredData = uniqueDataFromDB.map((row: ExcelData) => {
            return cleanedFields.reduce((filteredRow: { [key: string]: any }, field: string) => {
                // Если поле есть в row, добавляем его в filteredRow
                if (row.hasOwnProperty(field)) {
                    filteredRow[field] = row[field];
                }
                return filteredRow;
            }, {});
        }).filter((row: any) => Object.keys(row).length > 0);


        let rowIndex = batchIndex * batchSize + 2;

        if (rowIndex == 1) rowIndex = 2;
        const numberOfColumns = xlsx.utils.decode_range(<string>worksheet["!ref"]).e.c + 1;
        worksheet["!cols"] = Array.from({ length: numberOfColumns }, () => ({
            wpx: 115,
        }));
        xlsx.utils.sheet_add_json(worksheet, filteredData, {
            skipHeader: true,
            origin: `A${rowIndex}`,
            dateNF: "yyyy-mm-dd HH:MM:ss",
        });

        allData.push(...filteredData);
    }

    while (true) {
        let sqlQuery = generateSQLQuery(
            fieldArray.toString(),
            serviceId,
            serverId,
            type,
            startDate,
            endDate
        );
        sqlQuery = addOrderLimitOffset(sqlQuery, offset, batchSize);

        let dataFromDB: any[] = await fetchDataFromDatabase(sqlQuery);
        await processDataChunk(dataFromDB);

        if (dataFromDB.length === 0) {
            break; // Прерывание цикла, если больше нет данных
        }

        offset += batchSize;
        batchIndex++;
    }

    if (allData.length > 0 && allData.every((row) => row.real_pay)) {
        const totalRow = ["Итоговая сумма:"];
        const sumColumnIndexes = [3];
        sumColumnIndexes.forEach((columnIndex) => {
            const columnData = allData.map((row) => row.real_pay);
            const columnSum = columnData.reduce((acc, value) => acc + value, 0);
            totalRow.push(columnSum);
        });
        xlsx.utils.sheet_add_aoa(worksheet, [totalRow], {
            origin: `A${allData.length + 2}`,  // Увеличиваем на 2 для добавления отступа
        });
    }
    xlsx.utils.book_append_sheet(workbook, worksheet, "Sheet1");


    const writeFile = promisify(fs.writeFile);
    await writeFile(`files/` + outputPath, xlsx.write(workbook, { type: "buffer", bookType: "xlsx" }));
};
