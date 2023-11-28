import * as nodemailer from 'nodemailer';
import * as fs from "fs";
import {Response} from "express";
import {logError} from "../../utils/logger";

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
                    content: fs.readFileSync(`files/` + filename),
                }))
            };
            // Отправка письма
            try {
                console.log(await transporter.sendMail(mailOptions));
            } catch (error:any){
                if (error.responseCode != 550) {
                    throw error;
                }else {
                    logError(error);
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
