import { Model, DataTypes } from 'sequelize';
import sequelize from '../sequelize';

export class User extends Model {
  public id!: number;
  public login!: string;
  public passwd!: string;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    login: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    passwd: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
  },
);
