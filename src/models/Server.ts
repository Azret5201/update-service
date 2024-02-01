import {DataTypes, Model} from 'sequelize';
import sequelize from '../../config/sequelize';

export class Server extends Model {
    public id!: number;
    public name!: string;
}
Server.init(
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
    },
    {
        sequelize,
        timestamps: false,
        modelName: 'Server',
        tableName: 'bill_servers',
    },
);