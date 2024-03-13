import { Sequelize, DataTypes, Model } from 'sequelize';

/*
 * Модель на основе таблицы abonent_service_10187.
 * Создан для бухгалтерии.
 */

interface TSJDealerAttributes {
    code: number;
    name: string;
    address: string;
    fio: string;
    inn: string;
    okpo: number;
    bank: string;
    bik: string;
    bank_account: string;
    accountant: string;

}

class TSJDealer extends Model<TSJDealerAttributes>
    implements TSJDealerAttributes {
    public code!: number;
    public name!: string;
    public address!: string;
    public fio!: string;
    public inn!: string;
    public okpo!: number;
    public bank!: string;
    public bik!: string;
    public bank_account!: string;
    public accountant!: string;
}

export {TSJDealer, TSJDealerAttributes};

export function setupTSJDealerModel(sequelize: Sequelize): void {
    TSJDealer.init(
        {
            code: {
                type: DataTypes.STRING,
                allowNull: false,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            address: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            fio: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            inn: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            okpo: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            bank: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            bik: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            bank_account: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            accountant: {
                type: DataTypes.STRING,
                allowNull: true,
            },


        },
        {
            sequelize,
            timestamps: false,
            modelName: 'TSJDealer',
            /*
             * TODO: Переименовать в таблицу и написать описание.
             * Первый мысль, что эта таблица одна из таблиц базы клиентов оффлайн сервисов.
             */
            tableName: 'abonents_service_10187',
        },
    )
}
