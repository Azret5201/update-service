import {DataTypes, Model} from 'sequelize';
import sequelize from '../../config/sequelize';

export class Payment extends Model {
    public id!: number;
    public identifier!: any;
    public id_service!: number;
    public real_pay!: number;
    public time_proc!: any;
    public account!: any[];
    public time!: any;
    public id_trans!: any;
    public id_apparat!: any;
    public payments_run!: any;
    public additional2!: any;
    public additional1!: any;
    public total!: any;
    public time2!: any;
    public identifier2!: any;
    public id_bserver!: any;
    public time_app!: any;
    public sum_reduce!: any;
    public p_dlr!: any;
    public p_fed!: any;
    public ch_num!: any;
    public com_dlr!: any;
    public timeout!: any;
    public iscredit!: any;
    public real_pay_rur!: any;
    public id_region!: any;
    public credit!: any;
    public sales_tax!: any;
    public rent_tax!: any;
    public fee_total!: any;
    public fee_dealer!: any;
    public fee_parent!: any;
    public id_fee!: any;
    public id_commission!: any;
    public id_sales_tax!: any;
    public commission!: any;
    public external_time!: any;
    public id_max_commission!: any;
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
        },
        time: {
            type: DataTypes.DATE,
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
        additional2: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        additional1: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        total: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        time2: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        identifier2: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        id_bserver: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        time_app: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        sum_reduce: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        p_dlr: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        p_fed: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        ch_num: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        com_dlr: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        timeout: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        iscredit: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        real_pay_rur: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        id_region: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        credit: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        sales_tax: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        rent_tax: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        fee_total: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        fee_dealer: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        fee_parent: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        id_fee: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        id_commission: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        id_sales_tax: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        commission: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        external_time: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        id_max_commission: {
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
