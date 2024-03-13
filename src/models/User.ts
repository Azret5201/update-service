import { Sequelize, DataTypes, Model } from 'sequelize';

interface UserAttributes {
    id?: number;
    id_role: number;
    login: string;
    passwd: string;
    fio: string;
    blocked: string;
    id_region: number;

}

class User extends Model<UserAttributes>
    implements UserAttributes {
    public id!: number;
    public id_role!: number;
    public login!: string;
    public passwd!: string;
    public fio!: string;
    public blocked!: string;
    public id_region!: number;
}

export {User, UserAttributes};

export function setupUserModel(sequelize: Sequelize): void {
    User.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            id_role: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            login: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            passwd: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            fio: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            blocked: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
            },
            id_region: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        },
        {
            sequelize,
            timestamps: false,
            modelName: 'User',
            tableName: 'users',
        },
    );
}
