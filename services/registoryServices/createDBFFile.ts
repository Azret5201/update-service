import { promisify } from "util";
import * as fs from "fs";
import {
    addOrderLimitOffset,
    fetchDataFromDatabase,
    generateSQLQuery,
    setCorrectDateToSqlQuery
} from "./getDataForRegistory";
import { getAccountValueByKey } from "../../utils/account2str";

export const createDBFFile = async (serverId: string, serviceId: string, data: any[], outputPath: string, type: number, batchSize: number): Promise<void> => {
    let dataFromDB: any[] = [];

    const fields = data[0].fields.split(", ");;
    const columns = data[0].table_headers.split(", ");

    console.log(fields, ' is fields');

    let offset = 0;
    const dbfData: any[] = [];

    while (true) {
        let sqlQuery = data[0]['sql'] ? setCorrectDateToSqlQuery(data[0]['sql'], type) :
            generateSQLQuery(fields.toString(), serviceId, serverId, type);
        sqlQuery = addOrderLimitOffset(sqlQuery, offset, batchSize);
        dataFromDB = await fetchDataFromDatabase(sqlQuery);
        if (dataFromDB.length === 0) {
            break;
        }


        // Переименование ключей данных
        const renamedData: any[] = dataFromDB.map(item => {
            const renamedItem: any = {};
            fields.forEach((field: any, index: any) => {
                if (field.startsWith('account.')) {
                    const accountField = field.split('.')[1];
                    const accountValue = item.account.find((subItem: any) => subItem[0] === accountField);
                    renamedItem[columns[index]] = accountValue ? accountValue[1] : '';
                } else {
                    renamedItem[columns[index]] = item[field];
                }
            });
            return renamedItem;
        });

        console.log(renamedData)

        offset += batchSize;
        dbfData.push(...renamedData);
    }

    const fieldDescriptors = columns.map((column: string) => {
        return {
            name: column,
            fieldType: "C",
            size: 255
        };
    });

    const buffer = createDBFBuffer(fieldDescriptors, dbfData);
    fs.writeFileSync(outputPath, buffer);

    console.log('DBF file created successfully.');
};



const createDBFBuffer = (fieldDescriptors: any[], data: any[]): Buffer => {
    const headerLength = 32 + 32 * fieldDescriptors.length + 1;
    const recordLength = fieldDescriptors.reduce((sum, field) => sum + field.size, 1); // 1 for deletion flag
    const bufferLength = headerLength + data.length * recordLength + 1;
    const buffer = Buffer.alloc(bufferLength);
    buffer.fill(0);

    buffer.writeUInt8(0x03, 0); // dBASE III with no memo
    buffer.writeUInt32LE(data.length, 4); // Number of records
    buffer.writeUInt16LE(headerLength, 8); // Length of header
    buffer.writeUInt16LE(recordLength, 10); // Length of record

    let fieldOffset = 0;
    fieldDescriptors.forEach((field, index) => {
        const nameBuffer = Buffer.alloc(11);
        nameBuffer.fill(0);
        nameBuffer.write(field.name, 0);
        nameBuffer.copy(buffer, 32 + index * 32);
        buffer.writeUInt8(field.fieldType.charCodeAt(0), 32 + index * 32 + 11);
        buffer.writeUInt32LE(fieldOffset, 32 + index * 32 + 12); // Field data offset
        buffer.writeUInt8(field.size, 32 + index * 32 + 16); // Field length
        buffer.writeUInt8(0, 32 + index * 32 + 17); // Decimal count
        fieldOffset += field.size;
    });

    data.forEach((record, recordIndex) => {
        let recordOffset = headerLength + recordIndex * recordLength;
        buffer.writeUInt8(0x20, recordOffset); // Space character for deletion flag
        fieldDescriptors.forEach((field, fieldIndex) => {
            const value = record[field.name];

            console.log(`Writing value '${value}' to field '${field.name}'`);

            const valueBuffer = Buffer.alloc(field.size);
            valueBuffer.fill(0);
            valueBuffer.write(String(value), 0);
            valueBuffer.copy(buffer, recordOffset + 1 + fieldIndex * field.size);
        });
    });


    buffer.writeUInt8(0x1A, buffer.length - 4); // EOF marker

    return buffer;
};

