import { Sequelize } from 'sequelize-typescript';

const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  dialect: process.env.DB_PASSWORD, // например, 'mysql', 'postgres', 'sqlite', 'mssql'
  models: [__dirname + '/models'] // путь к каталогу моделей
});

export default sequelize;