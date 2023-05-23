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

    identifier_order: {
      type: DataTypes.SMALLINT,
      allowNull: false,
    },

    pay_sum_order: {
      type: DataTypes.SMALLINT,
      allowNull: true,
    },
  },
  {
    sequelize,
    timestamps: false,
    modelName: "ColumnOrders",
    tableName: "column_orders",
  }
);
