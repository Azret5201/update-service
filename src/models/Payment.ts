import { Sequelize, DataTypes, Model } from 'sequelize';

interface PaymentAttributes {
    id?: number;
    identifier: any;
    id_service: number;
    id_bserver: number;
    real_pay: number;
    time_proc: any;
    account: any[];
    payments_run: any;
    id_trans: any;
    id_apparat: any;
    id_region: any;
}

class Payment extends Model<PaymentAttributes>
    implements PaymentAttributes {
    public id!: number;
    public identifier!: any;
    public id_service!: number;
    public id_bserver!: number;
    public real_pay!: number;
    public time_proc!: any;
    public account!: any[];
    public payments_run!: any;
    public id_trans!: any;
    public id_apparat!: any;
    public id_region!: any;
}

export { Payment, PaymentAttributes };

export function setupPaymentModel(sequelize: Sequelize): void {
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
            },
            id_trans: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            id_apparat: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            payments_run: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            id_bserver: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            id_region: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            sequelize,
            paranoid: false,
            timestamps: false,
            modelName: 'Payments',
            tableName: 'payments_log',
        },
    );
}
