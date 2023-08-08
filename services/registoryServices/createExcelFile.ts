import * as xlsx from "xlsx";
import {promisify} from "util";
import * as fs from "fs";
import {
    addOrderLimitOffset,
    fetchDataFromDatabase,
    generateSQLQuery,
    setCorrectDateToSqlQuery
} from "./getDataForRegistory";
import {getAccountValueByKey} from "../../utils/account2str";

export const createExcelFile = async (data: any[], outputPath: string, type: number, batchSize: number): Promise<void> => {
    const workbook = xlsx.utils.book_new();
    const columns = data[0].table_headers.split(", ");
    const worksheet = xlsx.utils.aoa_to_sheet([columns]);

    const fields = data[0]['fields'];

    const serviceId = data[0]['service_id'];
    const serverId = data[0]['server_id'];

    console.log(fields, ' is fields');

    let offset = 0;
    let batchIndex = 0;
    let allData: any[] = [];
    while (true) {
        let sqlQuery = data[0]['sql'] ? setCorrectDateToSqlQuery(data[0]['sql'], type) : generateSQLQuery(fields.toString(), serviceId, serverId, type);
        sqlQuery = addOrderLimitOffset(sqlQuery, offset, batchSize);
        const dataFromDB = await fetchDataFromDatabase(sqlQuery);
        if (dataFromDB.length === 0) {
            break; // Прерывание цикла, если больше нет данных
        }
        dataFromDB.map((row) =>  console.log(row))
        if (fields.includes('account')){
            const match = fields.match(/account\.(.+)/);
            getAccountValueByKey(dataFromDB, match[1])
        }
        let rowIndex = batchIndex * batchSize + 1;

        if (rowIndex == 1) rowIndex = 2;
        xlsx.utils.sheet_add_json(worksheet, dataFromDB, { skipHeader: true, origin: `A${rowIndex}` });

        allData = allData.concat(dataFromDB);
        offset += batchSize;
        batchIndex++;
    }


    if (allData.map((row) => row.real_pay)) {
        const totalRow = ['Итоговая сумма:'];
        const sumColumnIndexes = [3];
        sumColumnIndexes.forEach((columnIndex) => {
            const columnData = allData.map((row) => row.real_pay);
            const columnSum = columnData.reduce((acc, value) => acc + value, 0);
            totalRow.push(columnSum);
        });
        xlsx.utils.sheet_add_aoa(worksheet, [totalRow], { origin: `A${allData.length + 2}` });
    }
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    const writeFile = promisify(fs.writeFile);
    await writeFile(outputPath, xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' }));
};