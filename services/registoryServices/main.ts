import { createExcelFile } from './createExcelFile';
import { Registry, RegistryFile } from "../../models/src/models/db";
import { sendRegistryFiles } from "./sendRegistryFiles";
import { Op } from "sequelize";
import { log, logError } from "../../utils/logger";

const main = async () => {
    try {
        const type = process.argv[2];

        if (!type) {
            console.error("Please provide a valid type as an argument.");
            return;
        }

        log('Script started.)');

        const registries = await Registry.findAll({
            include: [RegistryFile],
            where: {
                'type': type,
                'is_blocked': false,
                '$RegistryFiles.id$': {
                    [Op.not]: null
                }
            }
        });

        if (registries) {
            await processRecords(registries);
        }

        log('Script completed successfully.');
    } catch (error) {
        logError(error);
    }
    return 0;
};

const processRecords = async (registries: any[]) => {

    for (const registry of registries) {
        const registryFilePaths: string[] = [];
        log(registry['id'] + 'registry_id');
        const registryFiles = await registry.RegistryFiles;
        if (registryFiles) {
            const emailAddresses = registry['emails'];
            const registryId = registry['id']; // Идентификатор текущего реестра

            log(`Processing registry with ID: ${registryId}`);

            for (const item of registryFiles) {
                try {
                    log(`Processing registry file with ID: ${item['id']}`);
                    const filePath = 'files/' + item['id'] + 'output.xlsx';
                    await createExcelFile([item], filePath, registry.type, 1000);
                    registryFilePaths.push(filePath);
                    log(`Processed registry file ${item['id']} successfully.`);
                } catch (error) {
                    logError(error);
                }
            }

            try {
                await sendRegistryFiles(emailAddresses, registryFilePaths);
                log(`Registry with ID ${registryId} successfully sent to the specified addresses.`);
            } catch (error) {
                logError(error);
            }
        }
    }
}

main();
