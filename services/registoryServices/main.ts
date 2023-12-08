import { createExcelFile } from './createExcelFile';
import { createCSVFile } from "./createCSVFile";
import { createDBFFile } from "./createDBFFile";
import { Recipient, Registry } from "../../models/src/models/db";
import { sendRegistryFiles } from "./sendRegistryFiles";
import { Op } from "sequelize";
import { log, logError } from "../../utils/logger";
import moment from 'moment';
import {Service} from "../../models/src/models/Service";
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');




const main = async () => {

    const folderPath = path.join(__dirname, './../../files'); // Укажите путь к вашей папке "files"

    try {
        const type = process.argv[2];

        if (!type) {
            console.error("Please provide a valid type as an argument.");
            return;
        }

        log(`============ Script started ============ \n`);
        log('Remove old records from folder - Files');
        try {
            const files = fs.readdirSync(folderPath);

            // Пройдитесь по списку файлов и удалите каждый из них
            for (const file of files) {
                const filePath = path.join(folderPath, file);
                fs.unlinkSync(filePath);
                log(`Record delete: ${filePath}`);
            }

            log(`All old files have been successfully deleted \n`);
        } catch (err) {
            console.error('An error occurred while removing records:', err);
        }


        const recipients = await Recipient.findAll({
            include: [Registry],
            where: {
                'type': type,
                'is_blocked': false,
                '$Registries.id$': {
                    [Op.not]: null
                }
            }
        });

        if (recipients) {
            await processRecords(recipients);
        }
        backupRegistriesFiles(type);
        log(`============ Script completed ============ \n`)
    } catch (error) {
        logError(error);
    }
    return 0;
};

// Функция для создания резервной копии реестров
const backupRegistriesFiles = (type: any) => {
    const backupDir = path.join(__dirname, './../../registries_backup');
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
    archive.directory(path.join(__dirname, './../../files'), false);

    archive.pipe(output);
    archive.finalize();

    // Логируем информацию о создании резервной копии
    log(`Backup of registry files created successfully. \n`);
};


const processRecords = async (registries: any[]) => {

    for (const registry of registries) {
        const registryFilePaths: string[] = [];
        log('/////////// Start execution registry for recipient - '+ registry['name'] + ' ///////////');
        const registryFiles = await registry.Registries;
        if (registryFiles) {
            const emailAddresses = registry['emails'];
            const registryId = registry['id']; // Идентификатор текущего реестра

            log(`Processing registry with ID: ${registryId}`);

            for (const item of registryFiles) {
                const registryName = item['name'];
                const servicesId = item['services_id'];
                const serverId = item['server_id'];
                const formats:string = item['formats'];
                const isBlocked = item['is_blocked'];
                const currentDate = moment().format('YYYY-MM-DD');

                if (!isBlocked) {
                    log('-----------INFO------------')
                    log('Sender Id: ' + registryId);
                    log('Registry Id: ' + item['id']);
                    log('Sender Name: ' + registry['name']);
                    log('Registry Name: ' + registryName);
                    log('Server id: '+ serverId);
                    log('Services ids: '+ servicesId);
                    log('Formats: '+ formats);
                    log('Emails: '+ emailAddresses)
                    log('Current Date: '+ moment().format('YYYY-MM-DD HH:mm:ss'))

                    log('---------PROCESSING---------')
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
                                log(`Processing registry file with ID: ${item['id']}`);
                                const filePath = '[' + sanitizedRegistryName + ']_'+sanitizedServiceName+'_'+ currentDate + '.' + format;
                                console.log('bbbbbbbbbbbbbbbbbbbbb', filePath)
                                log(`Get data from service ${serviceId} in format ${format}`)
                                if (format.trim() == 'xlsx') {
                                    await createExcelFile(serverId, serviceId, [item], filePath, registry.type, 1000);
                                } else if (format.trim() == 'csv') {
                                    await createCSVFile(serverId, serviceId, [item], filePath, registry.type, 1000);
                                } else if (format.trim() == 'dbf') {
                                    await createDBFFile(serverId, serviceId, [item], filePath, registry.type, 1000);
                                } else {
                                    logError(`UNKNOWN FILE FORMAT: ${format}`)
                                    break;
                                }

                                registryFilePaths.push(filePath);
                                log(`Successfully processed registry file for service ${serviceId} in format ${format}.\n`);
                            } catch (error) {
                                logError(error);
                            }
                        }
                    }
                }
            }
            log('---------SENDING---------')
            try {
                await sendRegistryFiles(emailAddresses, registryFilePaths);
                log(`Registry ${registry['name']} with ID ${registryId} successfully sent to the specified addresses.`);
                log(`Emails: ${emailAddresses}`)
                log(`Files: ${registryFilePaths}`)
            } catch (error) {
                logError(error);
            }
            log('--------- FINISHED -------- \n')
        }
    }
}

main();
