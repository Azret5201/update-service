import { Model, DataTypes } from 'sequelize';
import sequelize from '../sequelize';
import {Registry} from "./Registry";
import {RecipientsRegistriesRelation} from "./RecipientsRegistriesRelation";

export class Recipient extends Model {
  public id!: number;
  public name!: string;
  public type!: number;
  public emails!: string;
  public is_blocked!: boolean;
  public Registries?: Registry[];
}

Recipient.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
      emails: {
      type: DataTypes.JSON,
      allowNull: true,
    },
      is_blocked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    }
  },
  {
    sequelize,
    timestamps: false,
    modelName: 'Recipient',
    tableName: 'recipients',
  },
);

