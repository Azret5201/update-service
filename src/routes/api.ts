import { Router } from 'express';
import { AbonentServiceController } from '../controllers/abonent/AbonentServiceController';
import { RecipientController } from '../controllers/registry/RecipientController';
import { UserController } from '../controllers/user/UserController';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import { PermissionMiddleware } from '../middleware/PermissionMiddleware'; // Исправленный импорт
import { RegistryController } from "../controllers/registry/RegistryController";
import { RegistryBackupController } from "../controllers/registry/RegistryBackupController";
import { RegistryLogController } from "../controllers/registry/RegistryLogController";
import { AcquiringController } from "../controllers/acquiring/AcquiringController";
import { RegistryResendController } from "../controllers/registry/RegistryResendController";
import { ExportReportController } from "../controllers/dealer/reports/ExportReportController";
import { TSJDealerController } from "../controllers/dealer/reports/TSJDealerController";
import { DatabaseController } from "../controllers/database/DatabaseController";
import { GSFRUpdateController } from "../controllers/GSFR/GSFRUpdateController";
import { PermissionController } from "../controllers/security/PermissionController";
import { RoleController } from "../controllers/security/RoleController";

const router = Router();
const abonentServiceController = new AbonentServiceController();
const recipientController = new RecipientController();
const registryController = new RegistryController();
const registryBackupController = new RegistryBackupController();
const registryLogController = new RegistryLogController();
const userController = new UserController();
const acquiringController = new AcquiringController();
const registryResendController = new RegistryResendController();
const exportRegistryController = new ExportReportController();
const tsjDealerController = new TSJDealerController();
const databaseController = new DatabaseController();
const gsfrUpdateController = new GSFRUpdateController();

const permissionController = new PermissionController();
const roleController = new RoleController();

router.post('/login', userController.login);
router.use(AuthMiddleware.authenticate);

router.post('/checkUserAccess', userController.getPermissionsRoleByUserId);



// router.get('/getDataFromDB', PermissionMiddleware.checkPermission('test_permission'), databaseController.getDataFromDB);

router.get('/getDataFromDB', databaseController.getDataFromDB);
router.post('/abonent-service/store', abonentServiceController.store);
router.post('/registry', registryController.store);
router.get('/registry/:id', registryController.show);
router.put('/registry/:id', registryController.update);
router.delete('/registry/:id', registryController.destroy);

router.post('/registry/resend', registryResendController.getRegistryData);
router.post('/registry/payments', registryResendController.getPayments);

router.post('/recipient', recipientController.store);
router.get('/recipient/:id', recipientController.show);
router.put('/recipient/:id', recipientController.update);
router.delete('/recipient/:id', recipientController.destroy);

router.get('/registryBackup/index', registryBackupController.getBackups);
router.post('/registryBackup/download', registryBackupController.downloadBackup);

router.get('/registryLog/index', registryLogController.getLogs);
router.post('/registryLog/download', registryLogController.downloadLog);

router.post('/acquiring/comparison', acquiringController.comparison);

router.post('/dealer/reports/createReport', exportRegistryController.createReport);

router.post('/dealer/reports/updateTSJDealer', tsjDealerController.updateDealer);
router.post('/GSFR/updateGFSR', gsfrUpdateController.update);


router.post('/permission', permissionController.store);
router.get('/permission/:id', permissionController.show);
router.put('/permission/:id', permissionController.update);
router.delete('/permission/:id', permissionController.destroy);

// router.post('/role', roleController.store);
router.get('/role/:id', roleController.show);
router.put('/role/:id', roleController.update);
// router.delete('/role/:id', roleController.destroy);

export default router;
