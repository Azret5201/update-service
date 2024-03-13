import { Sequelize, DataTypes, Model } from 'sequelize';

interface ServiceAttributes {
    id?: number;
    name: string;
    id_bserver: number;
}

class Service extends Model<ServiceAttributes>
    implements ServiceAttributes {
    public id!: number;
    public name!: string;
    public id_bserver!: number;
}

export {Service, ServiceAttributes};

export function setupServiceModel(sequelize: Sequelize): void {
    Service.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            id_bserver: {
                type: DataTypes.INTEGER,
                allowNull: false,
            }
        },
        {
            sequelize,
            timestamps: false,
            modelName: 'Service',
            tableName: 'services',
        },
    );
}
