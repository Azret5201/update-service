import { Sequelize, DataTypes, Model } from 'sequelize';


interface ColumnOrderAttributes {
    id?: number;
    service_id: number;
    identifier_order: number;
    pay_sum_order: number;
}

class ColumnOrder extends Model<ColumnOrderAttributes>
    implements ColumnOrderAttributes {
    public id!: number;
    public service_id!: number;
    public identifier_order!: number;
    public pay_sum_order!: number;
}

export { ColumnOrder, ColumnOrderAttributes };

export function setupColumnOrderModel(sequelize: Sequelize): void {
ColumnOrder.init(
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
        modelName: 'ColumnOrders',
        tableName: 'column_orders',
    },
);
}
