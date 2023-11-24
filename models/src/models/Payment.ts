import { Model, DataTypes } from 'sequelize';
import sequelize from '../sequelize';

export class Payment extends Model {
    public id!: number;
    public identifier!: any;
    public id_service!: number;
    public real_pay!: number;
    public time_proc!: any;
    public account!: any[];
}

Payment.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        identifier: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        id_service: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        real_pay: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        time_proc: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        account: {
            type: DataTypes.ARRAY(DataTypes.JSON),
            allowNull: false,
        }
    },
    {
        sequelize,
        paranoid: false,
        timestamps: false,
        modelName: 'Payments',
        tableName: 'payments_log_y2023_06',

    },
);

