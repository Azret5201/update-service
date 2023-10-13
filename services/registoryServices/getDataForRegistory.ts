import {QueryTypes} from "sequelize";
import sequelize from "../../models/src/sequelize";
import moment from 'moment';
import {log, logError} from "../../utils/logger";


export const fetchDataFromDatabase = async (sql: string) => {
    try {
        return await sequelize.query(sql, {type: QueryTypes.SELECT});
    } catch (error: any) {
        let sqlError = error.parent;
        logError(sqlError);
        console.error('Произошла ошибка при выполнении запроса:', error);
        return [];
    }
};

export const generateSQLQuery = (fields: string, serviceId: string, serverId: string, type: number) => {
    const correctDateTimes = getCorrectDateTime(type);
    if (fields.includes('account')) {
        const match = fields.match(/account\.[\w]+/g);
        if (match) {
            const lastMatch = match[match.length - 1];
            fields = fields.replace(lastMatch, 'account');
        }
    }

    return `SELECT ${fields}
            FROM payments_log
            WHERE payments_run = 1
              AND id_service = '${serviceId}'
              AND time_proc >= '${correctDateTimes[0]}'
              AND time_proc <= '${correctDateTimes[1]}'
              AND id_bserver = '${serverId}'`;
};

export const addOrderLimitOffset = (sql: string, offset: number, limit: number) => {
    return `${sql}
                     ORDER BY id
                     LIMIT ${limit}
                     OFFSET ${offset}`;
};

export const getCorrectDateTime = (type: number) => {
    let startDate = moment().startOf('day').subtract(1, 'day');
    let endDate = moment(startDate).endOf('day');
    switch (type) {
        case 2:
            startDate = moment(startDate).startOf('isoWeek');
            endDate = moment(endDate).endOf('isoWeek');
            break;
        case 3:
            startDate = moment(startDate).startOf('month');
            endDate = moment(endDate).endOf('month');
            break;
        case 4:
            startDate = moment(startDate).startOf('year');
            endDate = moment(endDate).endOf('year');
            break;
    }

    // Преобразуем даты в нужный формат
    const formattedStartDate = startDate.format('YYYY-MM-DD 00:00:00');
    const formattedEndDate = endDate.format('YYYY-MM-DD 23:59:59');

    return [formattedStartDate, formattedEndDate];
};

export const setCorrectDateToSqlQuery = (sqlQuery: string, type: number) => {
    const correctDateTimes = getCorrectDateTime(type);
    return sqlQuery.replace('$dateFrom', correctDateTimes[0]).replace('$dateTo', correctDateTimes[1]);
}