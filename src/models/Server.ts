import { Sequelize, DataTypes, Model } from 'sequelize';

interface ServerAttributes {
    id?: number;
    name: string;
}

class Server extends Model<ServerAttributes>
    implements ServerAttributes {
    public id!: number;
    public name!: string;
}

export {Server, ServerAttributes};

export function setupServerModel(sequelize: Sequelize): void {
    Server.init(
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
        },
        {
            sequelize,
            timestamps: false,
            modelName: 'Server',
            tableName: 'bill_servers',
        },
    );
}
