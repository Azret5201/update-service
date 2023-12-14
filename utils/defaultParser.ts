import fs from 'fs/promises';
import { createReadStream, read } from 'fs';
import { ColumnOrder } from '../models/src/models/ColumnOrder';
import path, { ParsedPath } from 'path';
import { AbonentService } from '../models/src/models/AbonentService';
import { writeLogToFile } from './logger';
import { log } from 'console';
import { cast } from 'sequelize';

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
      where: { service_id },
    });
    console.log(`Очередь по сервису ${service_id} успешно получены!`)

    return orders?.dataValues;
  } catch(error) {
    console.error('Очередь не получена!', error)
  }
}

export async function getAbonentMark (service_id: string) {
const abonents = await AbonentService.findOne({
  attributes: ['delete_mark'],
  where: { service_id }
});

return abonents ? abonents?.dataValues.delete_mark : false;
}

export async function removeOldAbonents(service_id: string, delete_mark: boolean) {
  await AbonentService.destroy({
    where: {
      service_id: service_id,
      delete_mark: delete_mark
    }
  });
}

async function upsertData(serviceName:string[], orders:any, abonentsMark:boolean, file:ParsedPath) {
  let remaining = '';
  if (orders) {
    try {
      const readStream = createReadStream(path.resolve(file.dir, file.base));
      const promises:any = [];
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
              const promise = AbonentService.findOne({ where: { identifier: query.identifier, service_id: query.service_id }})
                .then((abonentService) => {
                  if (abonentService) {
                    return abonentService.update({
                      identifier: query.identifier,
                      service_id: query.service_id,
                      pay_sum: query.pay_sum,
                      delete_mark: query.delete_mark,
                      another_data: query.another_data
                    })
                  } else {
                    AbonentService.create(query as any);
                  }
                });
                promises.push(promise)
            }
          }
        catch (error) {
         console.log('error')
        }
        }
        remaining = remaining.substring(last);
      });
      readStream.on('end', async () => {
        await Promise.all(promises);
        await removeOldAbonents(serviceName[0], abonentsMark);
      })
      
      writeLogToFile(
        'successful',
        `Данные базы абонентов ${file.name} успешно записаны в таблицу ${AbonentService.tableName}`,
      );
      fs.rm(path.resolve(file.dir, file.base));

    } catch (err) {
      writeLogToFile(
        'error',
        `Не удалось записать в таблицу ${AbonentService.tableName} данные базы абонентов ${file.name}`,
      );
    }
  } else {
    writeLogToFile('error', `Не удалось найти очереди в таблице column_orders для сервиса ${file.name}`);
  }
}

export async function parserFile(file: ParsedPath) {
  const serviceName = file.name.toString().split('_');
  const orders = await getOrders(serviceName[0]);
  const abonentsMark = await getAbonentMark(serviceName[0]);
  
  await upsertData(serviceName, orders, abonentsMark, file);
}


