import * as nodemailer from 'nodemailer';
import * as fs from "fs";
import {Response} from "express";
// import {logger.logError(} from "../../utils/logger";
import {getAbsolutePath} from "../../utils/pathUtils";
import {Logger} from "../../utils/logger2";
require('dotenv').config();
const logger = new Logger('registries');
export const sendRegistryFiles = async (emailAddresses: string, registryFiles: string[]) => {
    const transporter = nodemailer.createTransport({
        host: 'mail.quickpay.kg',
        port: 465,
        secure: true,
        auth: {
            user: 'reestr@quickpay.kg',
            pass: 'eish<eph8seevah!g0Besu*Mahv0vaeb'
        }
    });

    try {
        const emailsArray = emailAddresses.split(',').map(email => email.trim());

        for (const email of emailsArray) {
            const mailOptions = {
                from: 'reestr@quickpay.kg',
                to: email,
                subject: 'Реестры принятых платежей', // Тема письма
                text: 'Добрый день! В приложении реестры, которые вы запросили.',
                attachments: registryFiles.map(filename => ({
                    filename: filename,
                    content: fs.readFileSync(getAbsolutePath('storage/registries/files/') + filename),
                }))
            };
                //
                // console.log(await transporter.sendMail(mailOptions));
            // Отправка письма
            try {
                console.log(await transporter.sendMail(mailOptions));
            } catch (error:any){
                if (error.responseCode != 550 && error.responseCode != 504) {
                    throw error;
                }
                else {
                    logger.logError(error);
                }
            }
        }

        // Вернуть успешный результат после успешной отправки всех писем
        return true;
    } catch (error) {
        console.error('Ошибка при отправке письма:', error);
        // Вернуть ошибку в случае неудачи
        throw error;
    }
};
