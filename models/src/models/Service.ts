import {DataTypes, Model} from 'sequelize';
import sequelize from '../sequelize';

export class Service extends Model {
    public id!: number;
    public name!: string;
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
        }
    },
    {
        sequelize,
        timestamps: false,
        modelName: 'Service',
        tableName: 'services',
    },
);
