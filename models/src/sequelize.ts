import { Sequelize } from 'sequelize';
import { config } from '../../utils/config';
import { Dialect } from 'sequelize';

export const sequelize = new Sequelize(config.dbName, config.dbUser, config.dbPassword, {
  host: config.dbHost,
  port: +config.dbPort,
  dialect: config.dbDialect as Dialect,
});

export default sequelize;
