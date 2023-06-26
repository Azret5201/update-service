import {Router} from 'express';
import {AbonentServiceController} from '../controllers/AbonentServiceController';
import {AbonentServerController} from '../controllers/AbonentServerController';
import {UserController} from '../controllers/UserController';
import {AuthMiddleware} from '../middleware/AuthMiddleware';

const router = Router();
const abonentServiceController = new AbonentServiceController();
const abonentServerController = new AbonentServerController();
const userController = new UserController();

router.post('/login', userController.login);

router.use(AuthMiddleware.authenticate);
router.get('/users', userController.getUsers);
router.post('/abonent-service/store', abonentServiceController.store);
router.get('/listServices', abonentServiceController.getServices);
router.get('/listSevers', abonentServerController.getServers);

export default router;
