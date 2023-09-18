import { Model, DataTypes } from 'sequelize';
import sequelize from '../sequelize';
import {Recipient} from "./Recipient";

export class Registry extends Model {
    public id!: number;
    public name!: string;
    public services_id!: object;
    public server_id!: object;
    public table_headers!: object;
    public fields!: object;
    public formats!: object;
    public is_blocked!: boolean;
    public sql_query?: string;
}

Registry.init(
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
        services_id: {
            type: DataTypes.JSON,
            allowNull: false,
        },
        server_id: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        table_headers: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        fields: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        formats: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        is_blocked: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        sql_query: {
            type: DataTypes.STRING,
            allowNull: true,
        }
    },
    {
        sequelize,
        timestamps: false,
        modelName: 'Registry',
        tableName: 'registries',
    },
);

