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


    private getFormattedDate(date: Date | undefined): string | null {
        const dateFormatOptions: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
        };

        return date ? date.toLocaleString('ru-RU', dateFormatOptions) : null;
    }

    public getFormattedCreatedAt() {
        const createdAt = this.getDataValue('createdAt') as Date | undefined;
        return this.getFormattedDate(createdAt);
    }

    public getFormattedUpdatedAt() {
        const updatedAt = this.getDataValue('updatedAt') as Date | undefined;
        return this.getFormattedDate(updatedAt);
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
