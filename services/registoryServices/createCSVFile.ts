import {promisify} from "util";
import * as fs from "fs";
import {addOrderLimitOffset, fetchDataFromDatabase, generateSQLQuery,} from "./getDataForRegistory";
import {getAccountValueByKey} from "../../utils/account2str";
import {Payment} from "../../models/src/models/Payment";
import {Op} from "sequelize";
import * as xlsx from "xlsx";

interface CsvData {
    id: string;
    [key: string]: any;

}

export const createCSVFile = async (
    serverId: string,
    serviceId: string,
    data: any[],
    outputPath: string,
    type: number,
    batchSize: number
): Promise<void> => {
    const { fields, startDate, endDate, paymentsList } = data[0];

    let paymentIds: string[] = [];
    if (paymentsList && paymentsList.length > 0) {
        const filteredPayments = paymentsList.filter(
            (payment: any) => payment.id_service === serviceId
        );
        paymentIds = filteredPayments.map((payment: any) => payment.id);
    }

    const payments = await Payment.findAll({
        where: {
            id: {
                [Op.in]: paymentIds,
            },
        },
    });
    let uniqueIds = new Set<string>();
    const columns = data[0].table_headers.split(", ");
    const registryFields = fields.split(", ");
    const hasIdColumn = /\b(id)\b/.test(fields);
    const fieldArray = hasIdColumn ? registryFields.join(", ") : ["id", ...registryFields];

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
    const paymentsWithSelectedKeys: CsvData[] = payments.map(removeNonMatchingKeys);

    let offset = 0;
    let batchIndex = 0;
    const csvData: string[] = [columns.join(',')]; // Инициализация с заголовочной строкой

    async function processDataChunk(dataFromDB: any[]) {
        const mergedData = paymentsWithSelectedKeys.concat(dataFromDB);

        // Удаление дубликатов по полю id

        let uniqueDataFromDB = mergedData.reduce((acc: CsvData[], item: CsvData) => {
            if (!uniqueIds.has(item.id)) {
                uniqueIds.add(item.id);
                acc.push(item);
            }
            return acc;
        }, []);



        // Обработка данных из массива account
        if (fields.includes("account")) {
            const match = fields.match(/account\.(.+)/);
            const accountKey = match ? match[1] : null;

            if (accountKey) {
                uniqueDataFromDB.forEach((row: CsvData) => {
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


        // Убираем ненужные ключи
        const filteredData = uniqueDataFromDB.map((row: CsvData) => {
            return cleanedFields.reduce((filteredRow: { [key: string]: any }, field: string) => {
                // Если поле есть в row, добавляем его в filteredRow
                if (row.hasOwnProperty(field)) {
                    filteredRow[field] = row[field];
                }
                return filteredRow;
            }, {});
        }).filter((row: any) => Object.keys(row).length > 0); // Фильтруем записи, оставляем только те, у которых есть хотя бы одно значение.



        csvData.push(...filteredData.map((row: any) => Object.values(row).map((value: any) => {
            // Если значение является строкой и содержит запятую, оберните его в кавычки
            if (typeof value === "string" && value.includes(",")) {
                return `"${value}"`;
            }
            return value;
        }).join(',')));
    }



    // ...

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

        let dataFromDB: any = await fetchDataFromDatabase(sqlQuery);
        await processDataChunk(dataFromDB);

        if (dataFromDB.length === 0) {
            break; // Прерывание цикла, если больше нет данных
        }

        offset += batchSize;
        batchIndex++;
    }

// Запись данных CSV в файл
    const writeFile = promisify(fs.writeFile);
    await writeFile(`files/` + outputPath, csvData.join('\n'));

};
