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

export const generateSQLQuery = (fields: string, serviceId: string, serverId: string, type: number, startDate: any, endDate: any) => {
    const correctDateTimes = getCorrectDateTime(type, startDate, endDate);

    if (fields.includes('account')) {
        // Разбиваем строку fields на массив по запятым
        const fieldArray = fields.split(',').map(f => f.trim());
        // Удаляем все элементы, которые начинаются с "account."
        const filteredFields = fieldArray.filter(f => !f.startsWith('account.'));
        // Добавляем "account" в конец массива
        filteredFields.push('account');
        // Снова объединяем массив в строку с запятой
        fields = filteredFields.join(', ');
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

export const getCorrectDateTime = (type: number, startDate:any, endDate:any) => {
    if (!startDate && !endDate) {
        startDate = moment().startOf('day').subtract(2, 'day');
        endDate = moment(startDate).endOf('day');
    } else {
        startDate = moment(startDate)
        endDate = moment(endDate)
    }

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

export const setCorrectDateToSqlQuery = (sqlQuery: string, type: number, startDate:any, endDate:any) => {
    const correctDateTimes = getCorrectDateTime(type, startDate, endDate);
    return sqlQuery.replace('$dateFrom', correctDateTimes[0]).replace('$dateTo', correctDateTimes[1]);
}