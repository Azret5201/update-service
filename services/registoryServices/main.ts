import { createExcelFile } from './createExcelFile';
import { createCSVFile } from "./createCSVFile";
import { createDBFFile } from "./createDBFFile";
import { Recipient, Registry } from "../../models/src/models/registry/db";
import { sendRegistryFiles } from "./sendRegistryFiles";
import { Op } from "sequelize";
// import { log, logError } from "../../utils/logger";
import moment from 'moment';
import {Service} from "../../models/src/models/Service";
import {getAbsolutePath} from "../../utils/pathUtils";
import {Logger} from "../../utils/logger2";
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const logger = new Logger('registries');


const main = async () => {

    const folderPath = getAbsolutePath('storage/registries/files/'); // Укажите путь к вашей папке "files"

    try {
        const type = process.argv[2];

        if (!type) {
            console.error("Please provide a valid type as an argument.");
            return;
        }

        logger.log(`============ Script started ============ \n`);
        logger.log('Remove old records from folder - Files');
        try {
            const files = fs.readdirSync(folderPath);

            // Пройдитесь по списку файлов и удалите каждый из них
            for (const file of files) {
                const filePath = path.join(folderPath, file);
                fs.unlinkSync(filePath);
                logger.log(`Record delete: ${filePath}`);
            }

            logger.log(`All old files have been successfully deleted \n`);
        } catch (err) {
            console.error('An error occurred while removing records:', err);
        }

        console.log('STARTING Recipient.findAll');
        let recipients
        try {
            recipients = await Recipient.findAll({
                include: [Registry],
                where: {
                    'type': type,
                    'is_blocked': false,
                    '$Registries.id$': {
                        [Op.not]: null
                    }
                }
            });
            console.log('Recipients:', recipients);
        } catch (error) {
            console.error('Error fetching recipients:', error);
        }
        if (recipients && recipients.length > 0) {
            await processRecords(recipients);
        }
        backupRegistriesFiles(type);
        logger.log(`============ Script completed ============ \n`)
    } catch (error) {
        logger.logError(error);
    }
    return 0;
};

// Функция для создания резервной копии реестров
const backupRegistriesFiles = (type: any) => {
    const backupDir = getAbsolutePath('storage/registries/backup/');
    let registryType;

    const typeToRegistryType:any = {
        1: 'daily',
        2: 'weekly',
        3: 'monthly',
        4: 'yearly'
    };
    if (typeToRegistryType[type]) {
        registryType = typeToRegistryType[type];
    } else {
        console.error("Invalid 'type' value.");
    }

    const output = fs.createWriteStream(path.join(backupDir, `backup_${registryType}_register_${moment().format('YYYY-MM-DD_HH-mm')}.zip`));
    const archive = archiver('zip', {
        zlib: { level: 9 } // Максимальное сжатие
    });

    // Создаем каталог для резервных копий, если его нет
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir);
    }

    // Поместите файлы реестров из папки "files" в архив
    archive.directory(getAbsolutePath('storage/registries/files/'), false);

    archive.pipe(output);
    archive.finalize();

    // Логируем информацию о создании резервной копии
    logger.log(`Backup of registry files created successfully. \n`);
};


const processRecords = async (registries: any[]) => {

    for (const registry of registries) {
        const registryFilePaths: string[] = [];
        logger.log('/////////// Start execution registry for recipient - '+ registry['name'] + ' ///////////');
        const registryFiles = await registry.Registries;
        if (registryFiles) {
            const emailAddresses = registry['emails'];
            const registryId = registry['id']; // Идентификатор текущего реестра

            logger.log(`Processing registry with ID: ${registryId}`);

            for (const item of registryFiles) {
                const registryName = item['name'];
                const servicesId = item['services_id'];
                const serverId = item['server_id'];
                const formats:string = item['formats'];
                const isBlocked = item['is_blocked'];
                const currentDate = moment().format('YYYY-MM-DD');

                if (!isBlocked) {
                    logger.log('-----------INFO------------')
                    logger.log('Sender Id: ' + registryId);
                    logger.log('Registry Id: ' + item['id']);
                    logger.log('Sender Name: ' + registry['name']);
                    logger.log('Registry Name: ' + registryName);
                    logger.log('Server id: '+ serverId);
                    logger.log('Services ids: '+ servicesId);
                    logger.log('Formats: '+ formats);
                    logger.log('Emails: '+ emailAddresses)
                    logger.log('Current Date: '+ moment().format('YYYY-MM-DD HH:mm:ss'))

                    logger.log('---------PROCESSING---------')
                    for (const serviceId of servicesId) {
                        
                        const service = await Service.findOne({
                            where: {
                                'id': serviceId,
                                }
                            })
                        let serviceName = 'Сервис';
                        if (service) {
                            serviceName = service.name;

                            console.log(`Имя сервиса: ${serviceName}`);
                        } else {
                            console.log('Сервис не найден.');
                        }


                        for (const format of formats) {
                            try {
                                const sanitizedRegistryName = registryName.replace(/[\/\\\.]/g, ' ');
                                const sanitizedServiceName = serviceName.replace(/[\/\\\.]/g, ' ');
                                logger.log(`Processing registry file with ID: ${item['id']}`);
                                const filePath = '[' + sanitizedRegistryName + ']_'+sanitizedServiceName+'_'+ currentDate + '.' + format;
                                logger.log(`Get data from service ${serviceId} in format ${format}`)
                                if (format.trim() == 'xlsx') {
                                    await createExcelFile(serverId, serviceId, [item], filePath, registry.type, 1000);
                                } else if (format.trim() == 'csv') {
                                    await createCSVFile(serverId, serviceId, [item], filePath, registry.type, 1000);
                                } else if (format.trim() == 'dbf') {
                                    await createDBFFile(serverId, serviceId, [item], filePath, registry.type, 1000);
                                } else {
                                    logger.logError(`UNKNOWN FILE FORMAT: ${format}`)
                                    break;
                                }

                                registryFilePaths.push(filePath);
                                logger.log(`Successfully processed registry file for service ${serviceId} in format ${format}.\n`);
                            } catch (error) {
                                logger.logError(error);
                            }
                        }
                    }
                }
            }
            logger.log('---------SENDING---------')
            try {
                await sendRegistryFiles(emailAddresses, registryFilePaths);
                logger.log(`Registry ${registry['name']} with ID ${registryId} successfully sent to the specified addresses.`);
                logger.log(`Emails: ${emailAddresses}`)
                logger.log(`Files: ${registryFilePaths}`)
            } catch (error) {
                logger.logError(error);
            }
            logger.log('--------- FINISHED -------- \n')
        }
    }
}

main();
