import {Router} from 'express';
import {AbonentServiceController} from '../controllers/abonent/AbonentServiceController';
import {RecipientController} from '../controllers/registry/RecipientController';
import {UserController} from '../controllers/user/UserController';
import {AuthMiddleware} from '../middleware/AuthMiddleware';
import {RegistryController} from "../controllers/registry/RegistryController";
import {RegistryBackupController} from "../controllers/registry/RegistryBackupController";
import {RegistryLogController} from "../controllers/registry/RegistryLogController";
import {AcquiringController} from "../controllers/acquiring/AcquiringController";
import {RegistryResendController} from "../controllers/registry/RegistryResendController";
import {ExportReportController} from "../controllers/dealer/reports/ExportReportController";
import {TSJDealerController} from "../controllers/dealer/reports/TSJDealerController";
import {DatabaseController} from "../controllers/database/DatabaseController";
import {GSFRUpdateController} from "../controllers/GSFR/GSFRUpdateController";


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

router.post('/login', userController.login);


router.use(AuthMiddleware.authenticate);

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

export default router;
