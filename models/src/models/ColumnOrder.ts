import { Model, Table, Column, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'column_orders',
  timestamps: false
})
export class ColumnOrder extends Model<ColumnOrder> {
  @Column({
    type: DataType.BIGINT,
    primaryKey: true,
    autoIncrement: true
  })
  id?: number;

  @Column({
    type: DataType.BIGINT,
    allowNull: false
  })
  service_id?: number;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: true
  })
  orders?: string[];
}