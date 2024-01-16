import {DataTypes, Model} from 'sequelize';
import sequelize from '../../sequelize';

export class RecipientsRegistriesRelation extends Model {
    public id!: number;
    public recipientId!: number;
    public registryId!: number;
}

RecipientsRegistriesRelation.init(
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
        modelName: 'RecipientsRegistriesRelation',
        tableName: 'recipients_registries_relation',
    }
);
