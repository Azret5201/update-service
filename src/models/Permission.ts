import {DataTypes, Model} from 'sequelize';
import sequelize from '../../config/sequelize';

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
    public createdAt!: string;
    public updatedAt!: string;
    startDate: any;
    endDate: any;
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
        },
        deletedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    },
    {
        sequelize,
        timestamps: true,
        paranoid: true,
        modelName: 'Registry',
        tableName: 'registries'
    },
);
