import { Sequelize, DataTypes, Model } from 'sequelize';

interface AbonentServiceAttributes {
    id?: number;
    identifier: string;
    service_id: number;
    pay_sum: number;
    delete_mark: boolean;
    another_data: string[];
}

class AbonentService extends Model<AbonentServiceAttributes>
    implements AbonentServiceAttributes {
    public id!: number;
    public identifier!: string;
    public service_id!: number;
    public pay_sum!: number;
    public delete_mark!: boolean;
    public another_data!: string[];
}

export { AbonentService, AbonentServiceAttributes };

export function setupAbonentServiceModel(sequelize: Sequelize): void {
    AbonentService.init(
        {
            id: {
                type: DataTypes.BIGINT,
                autoIncrement: true,
                primaryKey: true,
            },
            identifier: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            service_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
            },
            pay_sum: {
                type: DataTypes.DOUBLE,
                allowNull: true,
            },
            delete_mark: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
            },
            another_data: {
                type: DataTypes.JSON,
                allowNull: true,
            },
        },
        {
            indexes: [
                {
                    unique: true,
                    fields: ['identifier', 'service_id'],
                    name: 'idx_unique_identifier_service_id'
                },
            ],
            sequelize,
            timestamps: false,
            modelName: 'AbonentService',
            tableName: 'abonent_service',
        },
    );
}
