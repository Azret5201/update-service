import {DataTypes, Model} from 'sequelize';
import sequelize from '../../config/sequelize';

export class Service extends Model {
    public id!: number;
    public name!: string;
    public id_bserver!: number;
}

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
