import {DataTypes, Model} from 'sequelize';
import sequelize from '../../sequelize';

export class RecipientsRegistriesRelation extends Model {
    public id!: number;
    public recipient_id!: number;
    public registry_id!: number;
}

RecipientsRegistriesRelation.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        recipient_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'recipient_id',
        },
        registry_id: {
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
