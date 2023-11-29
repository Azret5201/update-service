import { Model, DataTypes } from 'sequelize';
import sequelize from '../sequelize';
import { Registry } from './Registry';

export class Recipient extends Model {
    public id!: number;
    public name!: string;
    public type!: number;
    public emails!: string;
    public is_blocked!: boolean;
    public createdAt!: string;
    public updatedAt!: string;
    public Registries?: Registry[];


    public getFormattedCreatedAt() {
        const updatedAt = this.getDataValue('createdAt');
        return updatedAt ? new Date(updatedAt).toLocaleString() : null;
    }
    public getFormattedUpdatedAt() {
        const updatedAt = this.getDataValue('updatedAt');
        return updatedAt ? new Date(updatedAt).toLocaleString() : null;
    }
}

Recipient.init(
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
        type: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        emails: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        is_blocked: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        deletedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            get() {
                return this.getFormattedCreatedAt();
            },
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            get() {
                return this.getFormattedUpdatedAt();
            },
        }
    },
    {
        sequelize,
        paranoid: true,
        timestamps: true,
        modelName: 'Recipient',
        tableName: 'recipients',
    },
);
