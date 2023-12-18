import { Sequelize, DataTypes } from 'sequelize';
import { config } from '../../utils/config';
import { Dialect } from 'sequelize';
import moment from 'moment-timezone';

export const sequelize = new Sequelize(config.dbName, config.dbUser, config.dbPassword, {
  host: config.dbHost,
  port: +config.dbPort,
  dialect: config.dbDialect as Dialect,
});

// Глобальный хук для преобразования дат при извлечении данных из базы
sequelize.addHook('afterFind', (results, options) => {
  if (Array.isArray(results)) {
    results.forEach((result) => {
      convertDates(result);
    });
  } else if (results) {
    convertDates(results);
  }
});

// Вспомогательная функция для преобразования дат в объекте
function convertDates(obj: any) {
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    if (value instanceof Date) {
      obj[key] = moment.utc(value).format('YYYY-MM-DD HH:mm:ss');
    } else if (typeof value === 'object' && value !== null) {
      convertDates(value);
    }
  });
}

export default sequelize;
