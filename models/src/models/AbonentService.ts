import { Model, Table, Column, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'abonent_service',
  timestamps: false
})
export class Abonent extends Model<Abonent> {
  @Column({
    type: DataType.BIGINT,
    primaryKey: true,
    autoIncrement: true
  })
  id?: number;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  idetifier?: string;

  @Column({
    type: DataType.DOUBLE,
    allowNull: true
  })
  pay_sum?: number;

  @Column({
    type: DataType.BIGINT,
    allowNull: false
  })
  service_id?: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false
  })
  delete_mark?: boolean;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: true
  })
  another_data?: string[];
}