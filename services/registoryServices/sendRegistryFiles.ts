import * as nodemailer from 'nodemailer';
import * as fs from "fs";


export const sendRegistryFiles = async (emailAddresses: string, registryFiles: string[]) => {

    const transporter = nodemailer.createTransport({
        host: 'mail.quickpay.kg',
        port: 465,
        secure: true,
        auth: {
            user: 'i.romanov@quickpay.kg',
            pass: '@Iskander001'
        }
    });

    try {
        const emailsArray = emailAddresses.split(',').map(email => email.trim());

        for (const email of emailsArray) {
            const mailOptions = {
                from: 'your_email@example.com',
                to: email,
                subject: 'Реестры', // Тема письма
                text: 'Добрый день! В приложении реестры, которые вы запросили.',
                attachments: registryFiles.map(filename => ({
                    filename: filename,
                    content: fs.readFileSync(filename),
                }))
            };

            // Отправка письма
            await transporter.sendMail(mailOptions);
        }
    } catch (error) {
        console.error('Ошибка при отправке письма:', error);
        throw error;
    }
};
