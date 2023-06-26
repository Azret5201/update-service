import { Model, DataTypes } from 'sequelize';
import sequelize from '../sequelize';

export class RegistryService extends Model {
  public id!: number;
  public title!: string;
  public type!: number;
  public rc_service_ids!: object;
}

RegistryService.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
      rc_service_ids: {
      type: DataTypes.JSON,
      allowNull: true,
    }
  },
  {
    sequelize,
    timestamps: false,
    modelName: 'RegistryService',
    tableName: 'rc_service',
  },
);
