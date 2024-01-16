import fs from 'fs/promises';
import {createReadStream} from 'fs';
import {ColumnOrder} from '../models/src/models/ColumnOrder';
import path, {ParsedPath} from 'path';
import {AbonentService} from '../models/src/models/AbonentService';
import {Logger} from './logger2';

const logger = new Logger('offline_clients');

interface Query {
    service_id?: number;
    identifier?: string;
    pay_sum?: string;
    another_data?: string[];
    delete_mark?: boolean;
}

export async function getFilesInDirectory(dirPath: string) {
    const files = await fs.readdir(dirPath);

    return files.map((file) => path.parse(path.resolve(dirPath, file)));
}

export async function getOrders(service_id: string) {
    try {
        const orders = await ColumnOrder.findOne({
            attributes: ['identifier_order', 'pay_sum_order'],
            where: {service_id},
        });
        logger.log(`Очередь по сервису ${service_id} успешно получены!`)
        return orders?.dataValues;
    } catch (error) {
        logger.log(`Очередь по сервису ${service_id} не получена!`)
        console.error('Очередь не получена!', error)
    }
}

export async function getAbonentMark(service_id: string) {
    const abonents = await AbonentService.findOne({
        attributes: ['delete_mark'],
        where: {service_id}
    });

    return abonents ? abonents?.dataValues.delete_mark : false;
}

export async function removeOldAbonents(service_id: string, delete_mark: boolean) {
    try {
        logger.log(`Remove old clients in service ${service_id}`);
        await AbonentService.destroy({
            where: {
                service_id: service_id,
                delete_mark: delete_mark
            }
        });
    } catch (err) {
        logger.log(`Can't remove clients in service ${service_id}`);
    }

}

async function upsertData(serviceName: string[], orders: any, abonentsMark: boolean, file: ParsedPath) {
    let remaining = '';

    if (orders) {
        try {
            const readStream = createReadStream(path.resolve(file.dir, file.base));
            const promises: any = [];
            readStream.on('data', async (chunk) => {
                remaining += chunk;
                let index = remaining.indexOf('\n');
                let last = 0;
                while (index > -1) {
                    const line = remaining.substring(last, index);

                    last = index + 1;
                    const lineColumns = line.split(',');
                    const query: Query = {};
                    let anotherData: string[] = [];

                    lineColumns.forEach((item, indexx) => {
                        if (orders.identifier_order - 1 === indexx) {
                            query['identifier'] = item;
                        } else if (orders.pay_sum_order - 1 === indexx) {
                            query['pay_sum'] = item;
                        } else {
                            anotherData.push(item);
                        }
                    });
                    query['another_data'] = anotherData;
                    query['service_id'] = +serviceName[0];
                    query['delete_mark'] = !abonentsMark;

                    index = remaining.indexOf('\n', last);
                    try {
                        if (query.identifier) {
                            query.another_data = query.another_data.map((str: string) => str.replace('\r', ''));
                            const promise = AbonentService.findOne({
                                where: {
                                    identifier: query.identifier,
                                    service_id: query.service_id
                                }
                            })
                                .then((abonentService) => {
                                    if (abonentService) {
                                        logger.log(`Client ${query.identifier} is exist in service ${query.identifier}, just updating information`)
                                        return abonentService.update({
                                            identifier: query.identifier,
                                            service_id: query.service_id,
                                            pay_sum: query.pay_sum,
                                            delete_mark: query.delete_mark,
                                            another_data: query.another_data
                                        })
                                    } else {
                                        ;
                                        logger.log(`Create new client in service ${query.identifier}`)
                                        AbonentService.create(query as any);
                                    }
                                });
                            promises.push(promise)
                        }
                    } catch (error) {
                        logger.log(`Upsert clients error: ${error}`)
                    }
                }
                remaining = remaining.substring(last);
            });
            readStream.on('end', async () => {
                await Promise.all(promises);
                await removeOldAbonents(serviceName[0], abonentsMark);
            })

            logger.log(
                `SUCCESSFUL: Clients from "${file.name}" file successfully inserting in table ${AbonentService.tableName}`,
            );
            fs.rm(path.resolve(file.dir, file.base));

        } catch (err) {
            logger.log(`ERROR: Can't insert clients data to the table ${AbonentService.tableName}: ${err}`,
            );
        }
    } else {
        logger.log(`ERROR: Can't find orders by service - ${file.name}`);
    }
}

export async function parserFile(file: ParsedPath) {
    const serviceName = file.name.toString().split('_');
    const orders = await getOrders(serviceName[0]);
    const abonentsMark = await getAbonentMark(serviceName[0]);

    await upsertData(serviceName, orders, abonentsMark, file);
}
