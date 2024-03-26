import { Sequelize, DataTypes, Model } from 'sequelize';

interface RolePermissionsAttributes {
    id?: number;
    role_id: number;
    permission_id: number;
}

class RolePermissions extends Model<RolePermissionsAttributes>
    implements RolePermissionsAttributes {
    public id!: number;
    public role_id!: number;
    public permission_id!: number;
}

export { RolePermissions, RolePermissionsAttributes };

export function setupRolePermissionsModel(sequelize: Sequelize): void {
    RolePermissions.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            role_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'id_role',
            },
            permission_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'id_permission',
            },
        },
        {
            sequelize,
            timestamps: false,
            modelName: 'RolePermissions',
            tableName: 'role_permissions',
        }
    );
}
