import { Model, DataTypes } from 'sequelize';
import sequelize from '../sequelize';

export class AbonentService extends Model {
  public id!: number;
  public identifier!: string;
  public service_id!: number;
  public pay_sum!: number;
  public delete_mark!: boolean;
  public another_data!: string[];
}

AbonentService.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    identifier: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    service_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    pay_sum: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    delete_mark: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    another_data: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    sequelize,
    timestamps: false,
    modelName: 'AbonentService',
    tableName: 'abonent_service',
  },
);
