import * as fs from "fs";
import {addOrderLimitOffset, fetchDataFromDatabase, generateSQLQuery} from "./getDataForRegistory";
import {Payment} from "../../models/src/models/Payment";
import {Op} from "sequelize";
import {getAbsolutePath} from "../../utils/pathUtils";

interface DbfData {
    id: string;

    [key: string]: any;

}

export const createDBFFile = async (serverId: string, serviceId: string, data: any[], outputPath: string, type: number, batchSize: number): Promise<void> => {
    let dataFromDB: any[] = [];
    let uniqueIds = new Set<string>();
    const {fields, startDate, endDate, paymentsList} = data[0];
    const columns = data[0].table_headers.split(", ");
    console.log(fields, ' is fields');


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
    const registryFields = fields.split(", ");
    const hasIdColumn = /\b(id)\b/.test(fields);
    // console.log(payments)
    const fieldArray = hasIdColumn ? [registryFields.join(", ")] : ["id", ...registryFields];

// Функция для удаления ненужных ключей из объекта
    const removeNonMatchingKeys = (payment: any) => {
        return payment.get({
            plain: true,
            attributes: fieldArray, // Указываем атрибуты, которые хотим получить
        });
    };


// Удаляем ненужные ключи из каждого объекта в массиве payments
    const paymentsWithSelectedKeys: any = payments.map(removeNonMatchingKeys);
    console.log(paymentsWithSelectedKeys)

    async function processDataChunk(dataFromDB: any[]) {

        const mergedData = paymentsWithSelectedKeys.concat(dataFromDB);

        // Удаление дубликатов по полю id

        let uniqueDataFromDB = mergedData.reduce((acc: DbfData[], item: DbfData) => {
            if (!uniqueIds.has(item.id)) {
                uniqueIds.add(item.id);
                acc.push(item);
            }
            return acc;
        }, []);


        uniqueDataFromDB = uniqueDataFromDB.map((row: any) => JSON.stringify(row));
        uniqueDataFromDB = Array.from(new Set(uniqueDataFromDB));
        uniqueDataFromDB = uniqueDataFromDB.map((row: any) => JSON.parse(row));

        uniqueDataFromDB.map((row: any) => console.log(row));

        if (!hasIdColumn) {
            // Если id не является частью регистра, удаляем его из объектов в uniqueDataFromDB
            uniqueDataFromDB = uniqueDataFromDB.map((item: any) => {
                delete item.id;
                return item;
            });
        }


        // Переименование ключей данных
        const renamedData: any[] = uniqueDataFromDB.map((item: any) => {
            const renamedItem: any = {};
            registryFields.forEach((field: any, index: any) => {
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

        dbfData.push(...renamedData);
    }

    let batchIndex = 0;
    let offset = 0;
    const dbfData: any[] = [];

    while (true) {
        let sqlQuery = generateSQLQuery(fieldArray.toString(), serviceId, serverId, type, startDate, endDate);
        sqlQuery = addOrderLimitOffset(sqlQuery, offset, batchSize);
        dataFromDB = await fetchDataFromDatabase(sqlQuery);

        await processDataChunk(dataFromDB);

        if (dataFromDB.length === 0) {
            break;
        }

        offset += batchSize;
        batchIndex++;
    }

    const fieldDescriptors = columns.map((column: string) => {
        return {
            name: column,
            fieldType: "C",
            size: 255
        };
    });

    const buffer = createDBFBuffer(fieldDescriptors, dbfData);
    fs.writeFileSync(getAbsolutePath('storage/registries/files/') + outputPath, buffer);

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
