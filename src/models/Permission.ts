import { Sequelize, DataTypes, Model } from 'sequelize';

interface PermissionAttributes {
    id?: number;
    name: string;
    title: string;
    description: string;
    deletedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

class Permission extends Model<PermissionAttributes>
    implements PermissionAttributes {
    public id!: number;
    public name!: string;
    public title!: string;
    public description!: string;
    public readonly deletedAt!: Date;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

export { Permission, PermissionAttributes };

export function setupPermissionModel(sequelize: Sequelize): void {
    Permission.init(
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
            title: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description: {
                type: DataTypes.STRING,
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
            modelName: 'Permission',
            tableName: 'access_permissions',
            timestamps: true,
            paranoid: true,
        }
    );
}
