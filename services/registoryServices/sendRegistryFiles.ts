import * as nodemailer from 'nodemailer';
import * as fs from "fs";
import {logError} from "../../utils/logger";
import {getAbsolutePath} from "../../utils/pathUtils";
require('dotenv').config();

export const sendRegistryFiles = async (emailAddresses: string, registryFiles: string[]) => {
    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: true,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    }as nodemailer.TransportOptions);

    try {
        const emailsArray = emailAddresses.split(',').map(email => email.trim());

        for (const email of emailsArray) {
            const mailOptions = {
                from: '"Slujba tehnicheskoi podderzhki Quickpay" <reestr@quickpay.kg>',
                to: email,
                subject: 'Реестры принятых платежей', // Тема письма
                text: 'Добрый день! В приложении реестры, которые вы запросили.',
                attachments: registryFiles.map(filename => ({
                    filename: filename,
                    content: fs.readFileSync(getAbsolutePath('storage/registries/files/') + filename),
                }))
            };
            // Отправка письма
            try {
                console.log(await transporter.sendMail(mailOptions));
            } catch (error:any){
                if (error.responseCode != 550 && error.responseCode != 504) {
                    throw error;
                }
                else {
                    logError(error);
                }
            }
        }

        return true;
    } catch (error) {
        console.error('Ошибка при отправке письма:', error);
        throw error;
    }
};
