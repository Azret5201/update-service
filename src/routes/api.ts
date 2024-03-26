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

router.post('/abonent-service/store',PermissionMiddleware.checkPermission('update_database'), abonentServiceController.store);

router.post('/registry',PermissionMiddleware.checkPermission('reports_management'), registryController.store);
router.get('/registry/:id',PermissionMiddleware.checkPermission('reports_management'), registryController.show);
router.put('/registry/:id',PermissionMiddleware.checkPermission('reports_management'), registryController.update);
router.delete('/registry/:id',PermissionMiddleware.checkPermission('reports_management'), registryController.destroy);

router.post('/registry/resend',PermissionMiddleware.checkPermission('reports_management'), registryResendController.getRegistryData);
router.post('/registry/payments',PermissionMiddleware.checkPermission('reports_management'), registryResendController.getPayments);

router.post('/recipient',PermissionMiddleware.checkPermission('reports_management'), recipientController.store);
router.get('/recipient/:id',PermissionMiddleware.checkPermission('reports_management'), recipientController.show);
router.put('/recipient/:id',PermissionMiddleware.checkPermission('reports_management'), recipientController.update);
router.delete('/recipient/:id',PermissionMiddleware.checkPermission('reports_management'), recipientController.destroy);

router.get('/registryBackup/index',PermissionMiddleware.checkPermission('reports_management'), registryBackupController.getBackups);
router.post('/registryBackup/download',PermissionMiddleware.checkPermission('reports_management'), registryBackupController.downloadBackup);

router.get('/registryLog/index',PermissionMiddleware.checkPermission('reports_management'), registryLogController.getLogs);
router.post('/registryLog/download',PermissionMiddleware.checkPermission('reports_management'), registryLogController.downloadLog);

router.post('/acquiring/comparison',PermissionMiddleware.checkPermission('develop'), acquiringController.comparison);

router.post('/dealer/reports/createReport',PermissionMiddleware.checkPermission('reports_dealer'), exportRegistryController.createReport);
router.post('/dealer/reports/updateTSJDealer',PermissionMiddleware.checkPermission('reports_dealer'), tsjDealerController.updateDealer);

router.post('/GSFR/updateGFSR',PermissionMiddleware.checkPermission('update_gsfr'), gsfrUpdateController.update);


router.post('/permission',PermissionMiddleware.checkPermission('access_management'), permissionController.store);
router.get('/permission/:id',PermissionMiddleware.checkPermission('access_management'), permissionController.show);
router.put('/permission/:id',PermissionMiddleware.checkPermission('access_management'), permissionController.update);
router.delete('/permission/:id',PermissionMiddleware.checkPermission('access_management'), permissionController.destroy);

// router.post('/role', roleController.store);
router.get('/role/:id',PermissionMiddleware.checkPermission('access_management'), roleController.show);
router.put('/role/:id',PermissionMiddleware.checkPermission('access_management'), roleController.update);
// router.delete('/role/:id', roleController.destroy);

export default router;
