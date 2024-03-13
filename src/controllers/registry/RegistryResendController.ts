import {Request, Response} from "express";
import {Recipient} from '../../models/Recipient';
import {createExcelFile} from "../../services/registoryServices/createExcelFile";
import {createCSVFile} from "../../services/registoryServices/createCSVFile";
import {createDBFFile} from "../../services/registoryServices/createDBFFile";
import {sendRegistryFiles} from "../../services/registoryServices/sendRegistryFiles";
import {Service} from "../../models/Service";
import {Payment} from "../../models/Payment";
import { Registry} from '../../models/Registry';


export class RegistryResendController {

    public static async processRecords(recipient: any, registryData: any, res: Response): Promise<void> {
        const registryFilePaths: string[] = [];
        const emailAddresses = recipient.emails;

        try {
            const registryName = recipient.name;
            const servicesId: [] = registryData.services_id;
            const serverId = registryData.server_id;
            const formats: string = registryData.formats;
            const startDate = registryData.startDate;
            const endDate = registryData.endDate;

            for (const serviceId of servicesId) {
                const service = await Service.findOne({
                    where: {
                        'id': serviceId,
                    }
                });

                if (!service) {
                    console.error(`Ошибка: Услуга с ID ${serviceId} не найдена`);
                    continue;
                }


                const serviceName = service.name;
                const sanitizedRegistryName = registryName.replace(/[\/\\.'"_\s]/g, '_');
                const sanitizedServiceName = serviceName.replace(/[\/\\.'"_\s]/g, '_');



                for (const format of formats) {
                    try {

                        const filePath = `[${sanitizedRegistryName}]_${sanitizedServiceName}_${startDate}_${endDate}.${format}`;

                        switch (format.trim()) {
                            case 'xlsx':
                                await createExcelFile(serverId, serviceId, [registryData], filePath, registryData.type, 1000);
                                break;
                            case 'csv':
                                await createCSVFile(serverId, serviceId, [registryData], filePath, registryData.type, 1000);
                                break;
                            case 'dbf':
                                await createDBFFile(serverId, serviceId, [registryData], filePath, registryData.type, 1000);
                                break;
                            default:
                                console.error(`Ошибка: Неизвестный формат файла: ${format}`);
                                break;
                        }

                        registryFilePaths.push(filePath);
                    } catch (error) {
                        console.error('Ошибка при обработке файла:', error);
                    }
                }
            }

            try {
                const success = await sendRegistryFiles(emailAddresses, registryFilePaths);

                if (success) {
                    res.status(200).json({success: true, message: 'Реестр успешно отправлен'});
                } else {
                    // Обработка ошибки, если sendRegistryFiles вернул ошибку
                    res.status(500).json({success: false, message: 'Произошла ошибка при отправке письма'});
                }

            } catch (error) {
                console.error('Ошибка при обработке записей:', error);
                res.status(500).json({success: false, message: `Произошла ошибка при отправке реестра \n ${error}`});
            }

        } catch (error) {
            console.error('Ошибка при обработке записей:', error);
            res.status(500).json({success: false, message: `Произошла ошибка при отправке реестра \n ${error}`});
        }
    }

    public async getRegistryData(req: Request, res: Response): Promise<void> {

        const recipient_id = req.body.formData.recipient_id;
        const registry_id = req.body.formData.registry_id;
        const formData = req.body.formData;
        const paymentsData: any[] = req.body.rows;
        const isTestEmailEnabled = req.body.formData.isTestEmailEnabled;

        const servicesIds: any[] = paymentsData.map(payment => payment.id_service);
        const uniqueServicesIds = Array.from(new Set(servicesIds));

        const serviceDifferences = uniqueServicesIds.filter((serviceId: any) => !formData.services_id.includes(serviceId));

        if (paymentsData.length !== 0 && serviceDifferences.length > 0) {
            res.status(400).json({
                success: false,
                message: 'В реестре отсутствуют некоторые необходимые сервисы, указанные в добавленных платежах. ' +
                    'Добавьте эти сервисы или удалите конфликтные платежи, чтобы продолжить.'
            });
            return;
        }

        try {
            const recipient: any = await Recipient.findOne({
                where: {
                    id: recipient_id,
                },
            });
            if (!recipient) {
                res.status(404).json({success: false, message: 'Получатель не найден'});
                return;
            }
            if (isTestEmailEnabled) {
                recipient.emails = formData.testEmail
            }
            const registryData: any = await Registry.findOne({
                where: {
                    id: registry_id,
                },
            });


            if (!registryData) {
                res.status(404).json({success: false, message: 'Реестр не найден'});
                return;
            }

            registryData.services_id = formData.services_id;
            registryData.formats = formData.formats;
            registryData.startDate = formData.startDate;
            registryData.endDate = formData.endDate;
            registryData.paymentsList = paymentsData;

            if (!registryData.services_id || !Array.isArray(registryData.services_id) || registryData.services_id.length === 0) {
                res.status(500).json({success: false, message: 'Отсутствуют выбранные сервисы для отправки реестра'});
                return;
            }


            if (registryData.startDate > registryData.endDate) {
                res.status(500).json({
                    success: false,
                    message: 'Неверные даты. Дата окончания не может быть раньше даты начала'
                });
                return;
            }

            await RegistryResendController.processRecords(recipient, registryData, res);

        } catch (error) {
            console.error('Ошибка при обработке данных реестра:', error);
            res.status(500).json({success: false, message: `Произошла ошибка при обработке данных реестра ${error}`});
        }
    }

    public async getPayments(req: Request, res: Response): Promise<void> {

        const paymentData = req.body.dataToSend;
        const paymentId = paymentData.paymentId;
        const servicesList = paymentData.servicesList;
        const paymentsList: any = paymentData.paymentsList;
        const paymentsIds = paymentsList.map((payment: any) => payment.id);

        if (paymentsIds && paymentsIds.includes(paymentId)) {
            res.status(400).json({success: true, message: 'Данный платёж уже находится в списке'});
            return;
        }

        try {
            const payment = await Payment.findOne({
                where: {
                    id: paymentId,
                },
            });

            console.log(payment)
            if (!servicesList.includes(payment?.id_service)) {
                res.status(400).json({
                    success: false,
                    message: `Невозможно добавить платёж! Платёж относится к сервису c ID - ${payment?.id_service}. 
                    Для того чтобы добавить данный платеж в список, пожалуйста, сначала укажите данный сервис в списке сервисов`,
                });
                return;

            }

            res.status(200).json({success: true, message: 'Платёж успешно добавлен в список', payment: payment});
        } catch (error) {
            res.status(404).json({success: false, message: 'Платёж не найден'});
        }
    }
}
