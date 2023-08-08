import {Router} from 'express';
import {AbonentServiceController} from '../controllers/AbonentServiceController';
import {AbonentServerController} from '../controllers/AbonentServerController';
import {RegistryController} from '../controllers/RegistryController';
import {UserController} from '../controllers/UserController';
import {AuthMiddleware} from '../middleware/AuthMiddleware';
import {RegistryFileController} from "../controllers/RegistryFileController";

const router = Router();
const abonentServiceController = new AbonentServiceController();
const abonentServerController = new AbonentServerController();
const registryController = new RegistryController();
const registryFileController = new RegistryFileController();
const userController = new UserController();

router.post('/login', userController.login);

router.use(AuthMiddleware.authenticate);
router.get('/users', userController.getUsers);
router.post('/abonent-service/store', abonentServiceController.store);
router.get('/listServices', abonentServiceController.getServices);
router.get('/listServers', abonentServerController.getServers);
router.get('/registry-file/index', registryFileController.getRegistryFilePage);
router.get('/registry-file/all', registryFileController.getRegistryFiles);
router.post('/registry-file', registryFileController.store);
router.get('/registry-file/:id', registryFileController.show);
router.put('/registry-file/:id', registryFileController.update);
router.delete('/registry-file/:id', registryFileController.destroy);
router.get('/registry/index', registryController.getRegistryPage);
router.get('/registry/all', registryController.getRegistries);
router.post('/registry', registryController.store);
router.get('/registry/:id', registryController.show);
router.put('/registry/:id', registryController.update);
router.delete('/registry/:id', registryController.destroy);

export default router;
