import { Model, DataTypes } from "sequelize";
import sequelize from "../sequelize";

export class DataClientParser extends Model {
  public id!: number;
  public name!: string;
  public class_name!: string;
}

DataClientParser.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    class_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    timestamps: false,
    modelName: "DataClientParser",
    tableName: "data_client_parsers",
  }
);
