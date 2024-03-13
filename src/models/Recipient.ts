import { Sequelize, DataTypes, Model } from 'sequelize';
import {Registry} from "./Registry";

interface RecipientAttributes {
    id?: number;
    name: string;
    type: number;
    emails: string;
    is_blocked?: boolean;
    deletedAt?: string;
    createdAt?: string;
    updatedAt?: string;
    Registries?: Registry[];
}

class Recipient extends Model<RecipientAttributes>
    implements RecipientAttributes {
    public id!: number;
    public name!: string;
    public type!: number;
    public emails!: string;
    public is_blocked!: boolean;
    public deletedAt!: string;
    public createdAt!: string;
    public updatedAt!: string;
    public Registries?: Registry[];
}

export { Recipient, RecipientAttributes };

export function setupRecipientModel(sequelize: Sequelize): void {
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
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
            },
        },
        {
            sequelize,
            paranoid: true,
            timestamps: true,
            modelName: 'Recipient',
            tableName: 'recipients',
        },
    );
}
