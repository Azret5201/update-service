import {Router} from 'express';
import {AbonentServiceController} from '../controllers/AbonentServiceController';
import {AbonentServerController} from '../controllers/AbonentServerController';
import {RecipientController} from '../controllers/RecipientController';
import {UserController} from '../controllers/UserController';
import {AuthMiddleware} from '../middleware/AuthMiddleware';
import {RegistryController} from "../controllers/RegistryController";
import {RegistryBackupController} from "../controllers/RegistryBackupController";
import {Recipient} from "../models/src/models/Recipient";

const router = Router();
const abonentServiceController = new AbonentServiceController();
const abonentServerController = new AbonentServerController();
const recipientController = new RecipientController();
const registryController = new RegistryController();
const registryBackupController = new RegistryBackupController();
const userController = new UserController();

router.post('/login', userController.login);

router.use(AuthMiddleware.authenticate);
router.get('/users', userController.getUsers);
router.post('/abonent-service/store', abonentServiceController.store);
router.get('/listServices', abonentServiceController.getServices);
router.get('/listServers', abonentServerController.getServers);
router.get('/registry/index', registryController.getRegistryPage);
router.get('/registry/all', registryController.getRegistries);
router.post('/registry', registryController.store);
router.get('/registry/:id', registryController.show);
router.put('/registry/:id', registryController.update);
router.delete('/registry/:id', registryController.destroy);
router.get('/recipient/index', recipientController.getRecipientPage);
router.get('/recipient/all', recipientController.getRegistries);
router.post('/recipient', recipientController.store);
router.get('/recipient/:id', recipientController.show);
router.put('/recipient/:id', recipientController.update);
router.delete('/recipient/:id', recipientController.destroy);
router.get('/registryBackup/index', registryBackupController.getBackups);
router.post('/registryBackup/download', registryBackupController.downloadBackup);

export default router;
