import {fetchDataFromDatabase} from "../../registoryServices/getDataForRegistory";

export const getDataForReport = async (startDate: any, endDate: any) => {
    const batchSize = 1000;
    let batchIndex = 0;
    let offset = 0;

    let reportData:any = [];

    try {
        while (true) {
            let sqlQuery = generateReportSQLQuery(startDate, endDate);
            sqlQuery = addOrderLimitOffsetReport(sqlQuery, offset, batchSize);

            let dataFromDB: any = await fetchDataFromDatabase(sqlQuery);

            if (dataFromDB.length === 0) {
                break; // Прерывание цикла, если больше нет данных
            }

            reportData = [...reportData, ...dataFromDB];


            if (dataFromDB.length < batchSize) {
                break; // В случае, если количество полученных записей меньше, чем указано в batchSize, останавливаем цикл
            }

            offset += batchSize;
            batchIndex++;
        }
    } catch (error) {
        console.error('Ошибка при получении данных из базы данных:', error);
        throw error;
    }

    try {
        while (true) {
            let sqlQuery = generateSQLQueryByBserver(startDate, endDate);
            sqlQuery = addOrderLimitOffsetReport(sqlQuery, offset, batchSize);

            let dataFromDB: any = await fetchDataFromDatabase(sqlQuery);

            if (dataFromDB.length === 0) {
                break; // Прерывание цикла, если больше нет данных
            }


            function getParam1Value(paymentAccount: any[]): string | null {
                const param1Entry = paymentAccount.find((entry: any[]) => entry[0] === 'param1');
                return param1Entry ? param1Entry[1] : null;
            }

            // Проходим по всем записям и изменяем bill_server_name
            dataFromDB.forEach((item: any) => {
                const param1Value = getParam1Value(item.payment_account);
                if (param1Value) {
                    item.bill_server_name = param1Value;
                }
            });

            // Объект для хранения группированных данных
            // Функция для группировки по region_id и bill_server_id
            function groupData(data: any[]): Record<string, any> {
                const groupedData: Record<string, any> = {};

                data.forEach((item: any) => {
                    const regionId = item.region_id;
                    const billServerName = item.bill_server_name;

                    if (!groupedData[billServerName]) {
                        groupedData[billServerName] = {};
                    }

                    if (!groupedData[billServerName][regionId]) {
                        groupedData[billServerName][regionId] = { ...item, total_real_pay: item.real_pay };
                    } else {
                        groupedData[billServerName][regionId].real_pay += item.real_pay;
                        groupedData[billServerName][regionId].total_real_pay += item.real_pay;
                    }
                });

                return groupedData;
            }


            const groupedData = groupData(dataFromDB);

            const resultArray = Object.values(groupedData)
                .map((regionData: any) => Object.values(regionData))
                .flat();

            reportData = [...reportData, ...resultArray];


            if (dataFromDB.length < batchSize) {
                break; // В случае, если количество полученных записей меньше, чем указано в batchSize, останавливаем цикл
            }

            offset += batchSize;
            batchIndex++;
        }
    } catch (error) {
        console.error('Ошибка при получении данных из базы данных:', error);
        throw error;
    }

    return reportData;
};



export const generateReportSQLQuery = (startDate: any, endDate: any) => {

return `
            SELECT 
                DATE(payments_log.time_proc) AS date,
                regions.id AS region_id,
                regions.name AS region_name,
                regions.dogovor AS region_dogovor,
                bill_servers.id AS bill_server_id,
                bill_servers.name AS bill_server_name,
                bill_servers.dogovor AS bill_server_dogovor,
                SUM(payments_log.real_pay) AS real_pay
            FROM payments_log
                JOIN bill_servers ON payments_log.id_bserver = bill_servers.id
                JOIN regions ON payments_log.id_region = regions.id            
            WHERE 
                payments_log.payments_run = 1
                AND DATE(payments_log.time_proc) >= '${startDate}'
                AND DATE(payments_log.time_proc) <= '${endDate}'
            
                AND bill_servers.is_test = false
                AND regions.blocked = 0
                AND bill_servers.id NOT IN (601, 10041) --10187
            
                AND payments_log.real_pay <> 0
                AND payments_log.real_pay IS NOT NULL
            GROUP BY
                date,
                regions.id,
                regions.name,
                regions.dogovor,
                bill_servers.id,
                bill_servers.name,
                bill_servers.dogovor`
};

export const generateSQLQueryByBserver = (startDate: any, endDate: any) => {

    return `
            SELECT 
                DATE(payments_log.time_proc) AS date,
                regions.id AS region_id,
                regions.name AS region_name,
                regions.dogovor AS region_dogovor,
                bill_servers.id AS bill_server_id,
                bill_servers.name AS bill_server_name,
                bill_servers.dogovor AS bill_server_dogovor,
                payments_log.account as payment_account,
                SUM(payments_log.real_pay) AS real_pay
            FROM payments_log
                JOIN bill_servers ON payments_log.id_bserver = bill_servers.id
                JOIN regions ON payments_log.id_region = regions.id            
            WHERE 
                payments_log.payments_run = 1
                AND DATE(payments_log.time_proc) >= '${startDate}'
                AND DATE(payments_log.time_proc) <= '${endDate}'
            
                AND bill_servers.is_test = false
                AND regions.blocked = 0
                AND bill_servers.id IN (10041)
            
                AND payments_log.real_pay <> 0
                AND payments_log.real_pay IS NOT NULL
            GROUP BY
                date,
                regions.id,
                regions.name,
                regions.dogovor,
                bill_servers.id,
                bill_servers.name,
                bill_servers.dogovor,
                payments_log.account`
};

export const addOrderLimitOffsetReport = (sql: string, offset: number, limit: number) => {
    return `${sql}
                ORDER BY bill_servers.id ASC
                LIMIT ${limit}
                OFFSET ${offset}`;
};