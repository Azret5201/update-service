import { Model, DataTypes } from "sequelize";
import sequelize from "../sequelize";

export class ColumnOrders extends Model {
  public id!: number;
  public service_id!: number;
  public orders!: string[];
}

ColumnOrders.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    service_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    orders: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "ColumnOrders",
    tableName: "column_orders",
  }
);
