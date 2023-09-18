import * as nodemailer from 'nodemailer';
import * as fs from "fs";
import {log} from "../../utils/logger";


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
        console.log(emailsArray)
        for (const email of emailsArray) {
            const mailOptions = {
                from: 'reestr@quickpay.kg',
                to: email,
                subject: 'Реестры принятых платежей', // Тема письма
                text: 'Добрый день! В приложении реестры, которые вы запросили.',
                attachments: registryFiles.map(filename => ({
                    filename: filename,
                    content: fs.readFileSync(filename),
                }))
            };

            // Отправка письма
            console.log(await transporter.sendMail(mailOptions));
        }
    } catch (error) {
        console.error('Ошибка при отправке письма:', error);
        throw error;
    }
};
