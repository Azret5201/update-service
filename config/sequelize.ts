import { Dialect, Model, Sequelize } from "sequelize";
import * as dotenv from "dotenv";
import moment from "moment-timezone";

dotenv.config();

const config = {
  dbPort: process.env.DB_PORT || "5432",
  dbHost: process.env.DB_HOST || "localhost",
  dbUser: process.env.DB_USERNAME || "postgres",
  dbPassword: process.env.DB_PASSWORD || "",
  dbName: process.env.DB_NAME || "",
  dbDialect: process.env.DB_DIALECT || "postgres",
};

export const sequelize = new Sequelize(config.dbName, config.dbUser, config.dbPassword, {
  host: config.dbHost,
  port: +config.dbPort,
  dialect: config.dbDialect as Dialect,
});

// Глобальный хук для преобразования дат при извлечении данных из базы
sequelize.addHook("afterFind", (results, options) => {
  if (Array.isArray(results)) {
    results.forEach((result) => {
      if (result instanceof Model) {
        convertDates(result.dataValues);
      }
    });
  } else if (results instanceof Model) {
    convertDates(results.dataValues);
  }
});

// Вспомогательная функция для преобразования дат в объекте
function convertDates(obj: any) {
  if (obj._convertedDates) {
    // Дата уже была преобразована, избегаем повторного преобразования
    return;
  }

  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    if (value instanceof Date) {
      obj[key] = moment.utc(value).format("YYYY-MM-DD HH:mm:ss");
    } else if (typeof value === "object" && value !== null) {
      // Помечаем объект, чтобы избежать бесконечной рекурсии
      value._convertedDates = true;
      convertDates(value);
    }
  });

  // Помечаем текущий объект, чтобы избежать повторного преобразования
  obj._convertedDates = true;
}

export default sequelize;