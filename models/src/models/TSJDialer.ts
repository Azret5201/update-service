import { Model, DataTypes } from 'sequelize';
import sequelize from '../sequelize';

export class TSJDialer extends Model {
    public code!: number;
    public name!: string;
    public address!: string;
    public fio!: string;
    public inn!: string;
    public okpo!: number;
    public bank!: string;
    public bik!: string;
    public bank_account!: string;
    public accountant!: string;

}

TSJDialer.init(
  {
      code: {
          type: DataTypes.STRING,
          allowNull: false,
          primaryKey: true,
      },
      name: {
          type: DataTypes.STRING,
          allowNull: true,
      },
      address: {
          type: DataTypes.STRING,
          allowNull: true,
      },
      fio: {
          type: DataTypes.STRING,
          allowNull: true,
      },
      inn: {
          type: DataTypes.STRING,
          allowNull: true,
      },
      okpo: {
          type: DataTypes.INTEGER,
          allowNull: true,
      },
      bank: {
          type: DataTypes.STRING,
          allowNull: true,
      },
      bik: {
          type: DataTypes.STRING,
          allowNull: true,
      },
      bank_account: {
          type: DataTypes.STRING,
          allowNull: true,
      },
      accountant: {
          type: DataTypes.STRING,
          allowNull: true,
      },


  },
  {
       sequelize,
       timestamps: false,
       modelName: 'TSJDialer',
       tableName: 'abonents_service_10187',
  },
);
