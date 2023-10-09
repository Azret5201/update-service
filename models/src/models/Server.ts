import { Model, DataTypes } from 'sequelize';
import sequelize from '../sequelize';

export class Server extends Model {
  public id!: number;
  public name!: string;
}

Server.init(
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
    timestamps: false,
    modelName: 'Server',s
    tableName: 'bill_servers',
  },
);
