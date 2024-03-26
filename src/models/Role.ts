import {DataTypes, Model, Sequelize} from 'sequelize';

interface RoleAttributes {
    id?: number;
    name: string;
    id_region: number;
    priority: number;
}

class Role extends Model<RoleAttributes>
    implements RoleAttributes {
    public id!: number;
    public name!: string;
    public id_region!: number;
    public priority!: number;
}

export {Role, RoleAttributes};

export function setupRoleModel(sequelize: Sequelize): void {
    Role.init(
        {
            id: {
                type: DataTypes.INTEGER,
                // autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            id_region: {
                type: DataTypes.INTEGER,
            },
            priority: {
                type: DataTypes.INTEGER,
            },
        },
        {
            sequelize,
            timestamps: false,
            modelName: 'Role',
            tableName: 'roles',
        },
    );
}
