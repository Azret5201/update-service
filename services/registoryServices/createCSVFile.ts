import { promisify } from "util";
import * as fs from "fs";
import {
    addOrderLimitOffset,
    fetchDataFromDatabase,
    generateSQLQuery,
    setCorrectDateToSqlQuery
} from "./getDataForRegistory";
import { getAccountValueByKey } from "../../utils/account2str";

export const createCSVFile = async (serverId: string, serviceId: string, data: any[], outputPath: string, type: number, batchSize: number): Promise<void> => {
    let dataFromDB: any[] = [];

    const fields = data[0]['fields'];
    const columns = data[0].table_headers.split(", ");

    console.log(fields, ' is fields');

    let offset = 0;
    let batchIndex = 0;
    const csvData: string[] = [columns.join(',')]; // Initialize with header row

    while (true) {
        let sqlQuery = data[0]['sql'] ? setCorrectDateToSqlQuery(data[0]['sql'], type) :
            generateSQLQuery(fields.toString(), serviceId, serverId, type);
        sqlQuery = addOrderLimitOffset(sqlQuery, offset, batchSize);
        dataFromDB = await fetchDataFromDatabase(sqlQuery);
        if (dataFromDB.length === 0) {
            break; // Прерывание цикла, если больше нет данных
        }
        // dataFromDB.map((row) => console.log(row))
        if (fields.includes('account')) {
            const match = fields.match(/account\.(.+)/);
            getAccountValueByKey(dataFromDB, match[1])
        }

        dataFromDB.forEach((row: any) => {
            const values = Object.keys(row).map((key: string) => {
                let value = row[key];

                if (typeof value === 'string' && value.includes(',')) {
                    value = `"${value}"`;
                }

                return value;
            });

            csvData.push(values.join(', '));
        });

        offset += batchSize;
        batchIndex++;
    }

    // Write CSV data to the file
    const writeFile = promisify(fs.writeFile);
    await writeFile(outputPath, csvData.join('\n'));
};

