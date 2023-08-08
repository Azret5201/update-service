import { Model, DataTypes } from 'sequelize';
import sequelize from '../sequelize';

export class RegistriesRegistryFilesRelation extends Model {
    public id!: number;
    public registryId!: number;
    public registryFileId!: number;
}

RegistriesRegistryFilesRelation.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        registryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'registry_id',
        },
        registryFileId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'registry_file_id',
        },
    },
    {
        sequelize,
        timestamps: false,
        modelName: 'RegistriesRegistryFilesRelation',
        tableName: 'registries_registry_files_relation',
    }
);

