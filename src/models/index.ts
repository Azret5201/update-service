import {Sequelize} from 'sequelize';
import sequelize from '../../config/sequelize';
import {setupPermissionModel} from './Permission';
import {setupRecipientModel} from "./Recipient";
import {setupAbonentServiceModel} from "./AbonentService";
import {setupColumnOrderModel} from "./ColumnOrder";
import {setupPaymentModel} from "./Payment";
import {setupRecipientRegistryModel} from "./RecipientRegistry";
import {setupRegistryModel} from "./Registry";
import {setupRoleModel} from "./Role";
import {setupServerModel} from "./Server";
import {setupServiceModel} from "./Service";
import {setupTSJDealerModel} from "./TSJDealer";
import {setupUserModel} from "./User";
import {setupRolePermissionsModel} from "./RolePermissions";
import { setupDealerModel } from './Dealer';

// Определите функцию для инициализации всех моделей
async function initModels(): Promise<void> {
    //Список моделей
    setupAbonentServiceModel(sequelize);
    setupColumnOrderModel(sequelize);
    setupPaymentModel(sequelize);
    setupRecipientModel(sequelize);
    setupRecipientRegistryModel(sequelize);
    setupPermissionModel(sequelize);
    setupRolePermissionsModel(sequelize);
    setupRegistryModel(sequelize);
    setupRoleModel(sequelize);
    setupServerModel(sequelize);
    setupServiceModel(sequelize);
    setupTSJDealerModel(sequelize);
    setupUserModel(sequelize);
    setupDealerModel(sequelize);
}

// Вызовите функцию инициализации моделей
initModels().then(() => {
    console.log('Все модели успешно зарегистрированы.');
}).catch(error => {
    console.error('Ошибка при регистрации моделей:', error);
});

// Экспортируйте экземпляр Sequelize для использования в других частях вашего приложения
export {sequelize, Sequelize};
