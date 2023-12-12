import { fetchDataFromDatabase } from "../../registoryServices/getDataForRegistory";
import { TSJDialer } from "../../../models/src/models/TSJDialer";

type SQLQueryGenerator = (startDate: any, endDate: any) => string;
type DataProcessor = (data: any[]) => void;

let reportData: any[] = [];
export const getDataForReport = async (startDate: any, endDate: any) => {
    const batchSize = 1000;
    let batchIndex = 0;
    let offset = 0;


    const fetchData = async (sqlQueryGenerator: SQLQueryGenerator, dataProcessor: DataProcessor) => {
        let dataFromDB: any;
        do {
            let sqlQuery = sqlQueryGenerator(startDate, endDate);
            sqlQuery = addOrderLimitOffsetReport(sqlQuery, offset, batchSize);

            dataFromDB = await fetchDataFromDatabase(sqlQuery);
            await dataProcessor(dataFromDB);  // Используйте await здесь

            offset += batchSize;
            batchIndex++;

        } while (dataFromDB.length >= batchSize);
    };



    try {
        await Promise.all([
            fetchData(generateReportSQLQuery, (dataFromDB) => {
                reportData.push(...dataFromDB);
            }),
            fetchData(generateSQLQueryByBserver, (dataFromDB) => {
                processBserverData(dataFromDB);
            }),
            fetchData(generateSQLQueryByTSJDiller, (dataFromDB) => {
                processTSJDillerData(dataFromDB);
            }),
        ]);
    } catch (error) {
        console.error('Ошибка при получении данных из базы данных:', error);
        throw error;
    }


    return reportData;
};

const processBserverData = (dataFromDB: any[]) => {
    dataFromDB.forEach((item) => {
        const param1Value = getParam1Value(item.payment_account);
        if (param1Value) {
            item.bill_server_name = param1Value;
            const isPhysicalPerson = [3366, 3264].includes(item.payment_id_service);
            const suffix = isPhysicalPerson ? 'физ. лица' : 'юр. лица';

            item.bill_server_name += ` (${suffix})`;
        }
    });

    const groupedData = groupData(dataFromDB);
    const resultArray = Object.values(groupedData).map((regionData: any) => Object.values(regionData)).flat();
    reportData.push(...resultArray);

};

const processTSJDillerData = async (dataFromDB: any[]) => {
    const allTSJDealers = await TSJDialer.findAll();

    dataFromDB.forEach((item) => {
        if (item.payment_identifier) {
            const paymentIdentifierDigits = item.payment_identifier.substring(0, 4);
            const matchingTSJDealer = allTSJDealers.find((dealer) => dealer.code === paymentIdentifierDigits);

            if (matchingTSJDealer) {
                item.dealer_name_tsj = matchingTSJDealer.name;
            }
        }
    })
    console.log(dataFromDB)
    const groupedData = groupDataDealerTSJ(dataFromDB);
    const resultArray = Object.values(groupedData).map((regionData: any) => Object.values(regionData)).flat();
    reportData.push(...resultArray);
};


const getParam1Value = (paymentAccount: any[]): string | null => {
    const param1Entry = paymentAccount.find((entry: any[]) => entry[0] === 'param1');
    return param1Entry ? param1Entry[1] : null;
};

const groupData = (data: any[]): Record<string, any> => {
    const groupedData: Record<string, any> = {};

    data.forEach((item: any) => {
        const regionId = item.dealer_id;
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
};

const groupDataDealerTSJ = (data: any[]): Record<string, any> => {
    const groupedData: Record<string, any> = {};

    data.forEach((item: any) => {
        const regionId = item.dealer_id;
        const dealerNameTSJ = item.dealer_name_tsj;

        if (!groupedData[dealerNameTSJ]) {
            groupedData[dealerNameTSJ] = {};
        }

        if (!groupedData[dealerNameTSJ][regionId]) {
            groupedData[dealerNameTSJ][regionId] = { ...item, total_real_pay: item.real_pay };
        } else {
            groupedData[dealerNameTSJ][regionId].real_pay += item.real_pay;
            groupedData[dealerNameTSJ][regionId].total_real_pay += item.real_pay;
        }
    });

    return groupedData;
};

export const generateReportSQLQuery = (startDate: any, endDate: any) => {
    return `
            SELECT 
                DATE(payments_log.time_proc) AS date,
                regions.id AS dealer_id,
                regions.name AS dealer_name,
                regions.dogovor AS dealer_dogovor,
                bill_servers.id AS bill_server_id,
                bill_servers.name AS bill_server_name,
                bill_servers.dogovor AS bill_server_dogovor,
                SUM(CASE WHEN payments_log.real_pay > 0 THEN payments_log.real_pay ELSE 0 END) AS real_pay
            FROM payments_log
                JOIN bill_servers ON payments_log.id_bserver = bill_servers.id
                JOIN regions ON payments_log.id_region = regions.id            
            WHERE 
                payments_log.payments_run = 1
                AND DATE(payments_log.time_proc) BETWEEN '${startDate}' AND '${endDate}'
                AND bill_servers.is_test = false
                AND regions.blocked = 0
                AND bill_servers.id NOT IN (601, 10041, 10187) 
            GROUP BY
                date,
                regions.id,
                regions.name,
                regions.dogovor,
                bill_servers.id,
                bill_servers.name,
                bill_servers.dogovor
            HAVING SUM(CASE WHEN payments_log.real_pay > 0 THEN payments_log.real_pay ELSE 0 END) > 0`;
};

export const generateSQLQueryByBserver = (startDate: any, endDate: any) => {
    return `
            SELECT 
                DATE(payments_log.time_proc) AS date,
                regions.id AS dealer_id,
                regions.name AS dealer_name,
                regions.dogovor AS dealer_dogovor,
                bill_servers.id AS bill_server_id,
                bill_servers.name AS bill_server_name,
                bill_servers.dogovor AS bill_server_dogovor,
                payments_log.account as payment_account,
                payments_log.id_service as payment_id_service,
                SUM(CASE WHEN payments_log.real_pay > 0 THEN payments_log.real_pay ELSE 0 END) AS real_pay
            FROM payments_log
                JOIN bill_servers ON payments_log.id_bserver = bill_servers.id
                JOIN regions ON payments_log.id_region = regions.id            
            WHERE 
                payments_log.payments_run = 1
                AND DATE(payments_log.time_proc) BETWEEN '${startDate}' AND '${endDate}'
                AND bill_servers.is_test = false
                AND regions.blocked = 0
                AND bill_servers.id IN (10041)
            GROUP BY
                date,
                regions.id,
                regions.name,
                regions.dogovor,
                bill_servers.id,
                bill_servers.name,
                bill_servers.dogovor,
                payments_log.account,
                payments_log.id_service
            HAVING SUM(CASE WHEN payments_log.real_pay > 0 THEN payments_log.real_pay ELSE 0 END) > 0`;
};

export const generateSQLQueryByTSJDiller = (startDate: any, endDate: any) => {
    return `
            SELECT 
                DATE(payments_log.time_proc) AS date,
                regions.id AS dealer_id,
                regions.name AS dealer_name,
                regions.dogovor AS dealer_dogovor,
                bill_servers.id AS bill_server_id,
                bill_servers.name AS bill_server_name,
                bill_servers.dogovor AS bill_server_dogovor,
                payments_log.identifier as payment_identifier,
                SUM(CASE WHEN payments_log.real_pay > 0 THEN payments_log.real_pay ELSE 0 END) AS real_pay
            FROM payments_log
                JOIN bill_servers ON payments_log.id_bserver = bill_servers.id
                JOIN regions ON payments_log.id_region = regions.id            
            WHERE 
                payments_log.payments_run = 1
                AND DATE(payments_log.time_proc) BETWEEN '${startDate}' AND '${endDate}'
                AND bill_servers.is_test = false
                AND regions.blocked = 0
                AND bill_servers.id IN (10187)
            GROUP BY
                date,
                regions.id,
                regions.name,
                regions.dogovor,
                bill_servers.id,
                bill_servers.name,
                bill_servers.dogovor,
                payments_log.identifier
            HAVING SUM(CASE WHEN payments_log.real_pay > 0 THEN payments_log.real_pay ELSE 0 END) > 0`;
};

export const addOrderLimitOffsetReport = (sql: string, offset: number, limit: number) => {
    return `${sql}
                ORDER BY bill_servers.id ASC
                LIMIT ${limit}
                OFFSET ${offset}`;
};
