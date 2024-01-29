import {DataTypes, Model} from 'sequelize';
import sequelize from '../../config/sequelize';

export class RecipientRegistry extends Model {
    public id!: number;
    public recipientId!: number;
    public registryId!: number;
}

RecipientRegistry.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        recipientId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'recipient_id',
        },
        registryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'registry_id',
        },
    },
    {
        sequelize,
        timestamps: false,
        modelName: 'RecipientRegistry',
        tableName: 'recipients_registries_relation',
    }
);
