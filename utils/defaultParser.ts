import fs from 'fs/promises';
import { createReadStream } from 'fs';
import { ColumnOrder } from '../models/src/models/ColumnOrder';
import path, { ParsedPath } from 'path';
import { AbonentService } from '../models/src/models/AbonentService';
import { writeLogToFile } from './logger';

interface Query {
  service_id?: number;
  identifier?: string;
  pay_sum?: string;
  another_data?: string[];
}

export async function getFilesInDirectory(dirPath: string) {
  const files = await fs.readdir(dirPath);
  return files.map((file) => path.parse(path.resolve(dirPath, file)));
}

export async function getOrders(service_id: string) {
  const orders = await ColumnOrder.findOne({
    attributes: ['identifier_order', 'pay_sum_order'],
    where: { service_id },
  });
  return orders?.dataValues;
}

export async function parserFile(file: ParsedPath) {
  const orders = await getOrders(file.name);
  let remaining = '';
  if (orders) {
    try {
      const readStream = createReadStream(path.resolve(file.dir, file.base));
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
          query['service_id'] = +file.name;

          index = remaining.indexOf('\n', last);
          if (query.identifier) {
            query.another_data = query.another_data.map((str: string) => str.replace('\r', ''));
            AbonentService.create(query as any);
          }
        }
        remaining = remaining.substring(last);
      });
      writeLogToFile(
        'successful',
        `Данные базы абонентов ${file.name} успешно записаны в таблицу ${AbonentService.tableName}`,
      );
      // fs.rm(path.resolve(file.dir, file.base));
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
