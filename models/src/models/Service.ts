import { Model, DataTypes } from 'sequelize';
import sequelize from '../sequelize';

export class Service extends Model {
  public id!: number;
  public name!: string;
}

Service.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  },
  {
    sequelize,
    modelName: 'Service',
    tableName: 'services',
  },
);
