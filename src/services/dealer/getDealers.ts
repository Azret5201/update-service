import { Dealer } from "../../models/Dealer";
import { sequelize } from '../../models';
import { copyFile } from "fs";
import { Logger } from "../../utils/logger2";

const logger = new Logger('telegram_bot');

export const getDealerByPhone = async (phone: string, userId: number) => {
    try {
        const sqlQuery = `SELECT id FROM regions WHERE phone = '${phone}'`;
        const [results, metadata]: [any[], any] = await sequelize.query(sqlQuery);

        if (results && results.length > 0) {
            logger.log(`Found the dealer by phone ${userId}`);
            setDealer(results[0].id, userId);

            return true;
        } else {
            logger.log(`Couldn't find such a dealer ${userId}`);

            return false; 
        }
    } catch (error) {
        console.error('Ошибка в функции getDuosDealer:', error);
        throw error; // Перевыбросить ошибку для ее передачи вызывающему
    }
}

export const setDealer = async (dealerId: number, telegramId: number) => {
    try {
        logger.log(`---Adding user to bot clients----`);
        const sqlQuery = `
            INSERT INTO bot_clients (region_id, telegram_id)
            VALUES (${dealerId}, ${telegramId})
        `;

        logger.log(`---Check user in bot clients by telegram id ${telegramId}----`);
        const user = await checkUser(telegramId);
        logger.log(`Result founding user in bo_clients: ${user}----`);
        if (!user) {
            logger.log(`---User ${dealerId} doesn't exist in bot clients ----\nInsert to bot_clients!`);

            await sequelize.query(sqlQuery);
            logger.log('Данные успешно добавлены в таблицу bot_clients');
        }

    } catch (error) {
        logger.log(`ERROR: Ошибка при добавлении данных в таблицу bot_clients: ${error}`);
        throw error; // Перевыбросываем ошибку для обработки выше
    }
}

export const getBalance = async (telegramId: number) => {
    const userDealerId = await getUser(telegramId);
    let message = '';
    if (userDealerId !== null) {
        const dealer = await getDealerById(userDealerId);
        if (dealer !== null) {
            message = `Ваш баланс: ${dealer.balance} \nВаш кредит: ${dealer.credit}`
        }
    } else {
        message = 'К сожалению не получилось взять ваш баланс. Обратитесь к вашему мменеджеру!'
    }

    return message;
}

export const checkUser = async (telegramId: number) => {
    logger.log('Start checking ...');
    const sqlQuery = `SELECT * FROM bot_clients WHERE telegram_id = ${telegramId}`;

    const [results, metadata] = await sequelize.query(sqlQuery);

    return results.length > 0 ? true : false;
}

export const getUser = async (telegramId: number) => {
    const sqlQuery = `SELECT region_id FROM bot_clients WHERE telegram_id = ${telegramId} LIMIT 1`;

    const [results, metadata]: [any[], any] = await sequelize.query(sqlQuery);


    return results.length > 0 ? results[0].region_id : null;
}

export const getDealerById = async (id: number) => {
    try {
        const sqlQuery = `SELECT balance, credit FROM regions WHERE id = ${id}`;

        const [results, metadata]: [any[], any] = await sequelize.query(sqlQuery);

        return results.length > 0 ? results[0] : null;
    } catch (error) {
        console.error('Ошибка в функции getDuosDealer:', error);
        throw error;
    }
}