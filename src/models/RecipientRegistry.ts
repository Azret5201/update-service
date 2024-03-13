import { Sequelize, DataTypes, Model } from 'sequelize';

interface RecipientRegistryAttributes {
    id?: number;
    recipient_id: number;
    registry_id: number;
}

class RecipientRegistry extends Model<RecipientRegistryAttributes>
    implements RecipientRegistryAttributes {
    public id!: number;
    public recipient_id!: number;
    public registry_id!: number;
}

export { RecipientRegistry, RecipientRegistryAttributes };

export function setupRecipientRegistryModel(sequelize: Sequelize): void {
    RecipientRegistry.init(
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
            modelName: 'RecipientRegistry',
            tableName: 'recipients_registries_relation',
        }
    );
}
