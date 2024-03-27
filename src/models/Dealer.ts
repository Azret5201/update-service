import { Sequelize, DataTypes, Model, DOUBLE } from 'sequelize';

interface DealerAttributes {
    id?: number;
    name: string;
    firm: string;
    balance: number;
    credit: number;
    block_limit: number;
    phone: string;
}

class Dealer extends Model<DealerAttributes> 
    implements DealerAttributes {
        public id!: number;
        public name!: string;
        public firm!: string;
        public balance!: number;
        public credit!: number;
        public block_limit!: number;
        public phone!: string;
    }

    export { Dealer, DealerAttributes }

export function setupDealerModel(sequelize: Sequelize): void {
    Dealer.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            firm: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            balance: {
                type: DataTypes.DOUBLE,
                allowNull: false,
            },
            credit: {
                type: DataTypes.DOUBLE,
                allowNull: false,
            },
            block_limit: {
                type: DataTypes.DOUBLE,
                allowNull: false,
            },
            phone: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        }, {
            sequelize,
            timestamps: false,
            modelName: 'Dealer',
            tableName: 'regions',
        }
    )
}
