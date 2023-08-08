import { Model, DataTypes } from 'sequelize';
import sequelize from '../sequelize';
import {Registry} from "./Registry";

export class RegistryFile extends Model {
    public id!: number;
    public name!: string;
    public service_id!: number;
    public server_id!: number;
    public table_headers!: object;
    public fields!: object;
    public sql_query?: string;
}

RegistryFile.init(
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
        service_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        server_id: {
            type: DataTypes.INTEGER,
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
        sql_query: {
            type: DataTypes.STRING,
            allowNull: true,
        }
    },
    {
        sequelize,
        timestamps: false,
        modelName: 'RegistryFile',
        tableName: 'registry_files',
    },
);

