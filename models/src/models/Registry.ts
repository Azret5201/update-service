import { Model, DataTypes } from 'sequelize';
import sequelize from '../sequelize';
import {RegistryFile} from "./RegistryFile";
import {RegistriesRegistryFilesRelation} from "./RegistriesRegistryFilesRelation";

export class Registry extends Model {
  public id!: number;
  public name!: string;
  public type!: number;
  public emails!: object;
  public is_blocked!: boolean;
  public RegistryFiles?: RegistryFile[];
}

Registry.init(
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
    modelName: 'Registry',
    tableName: 'registries',
  },
);

