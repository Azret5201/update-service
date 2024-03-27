import { Dealer } from "../../models/Dealer";
import { getAbsolutePath } from "../../utils/pathUtils";
import * as dotenv from "dotenv";
import { fetchDataFromDatabase } from "../registoryServices/getDataForRegistory";
import { ColumnOrder } from "../../models/ColumnOrder";
import { User } from "../../models/User";

let envFilePath = getAbsolutePath('.env');

dotenv.config({path: envFilePath});

export const getDuosDealer = async (id: number, phone: string) => {

    try {
        console.log('Ищем дилера с id:', id, 'и телефоном:', phone);
        // const dealer = await User.findAll({
        //     where: {
        //         id: 2,
        //     },
        // });

        
        const dealer = await User.findByPk(288);
        console.log(dealer)
        return dealer;
    } catch (error) {
        console.error('Ошибка в функции getDuosDealer:', error);
        throw error; // Перевыбросить ошибку для ее передачи вызывающему
    }

    // const sqlQuery = `SELECT * FROM regions WHERE id = ${id} AND phone = '${phone}'`;

    // const dealer =  await fetchDataFromDatabase(sqlQuery);
}