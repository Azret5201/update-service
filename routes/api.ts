import { Router } from 'express';
import { AbonentServiceController } from '../controllers/AbonentServiceController';
import { UserController } from '../controllers/UserController';
import { AuthMiddleware } from '../middleware/AuthMiddleware';

// Enable CORS for all routes
const router = Router();
const abonentServiceController = new AbonentServiceController();
const userController = new UserController();

router.post('/login', userController.login);
router.get('/users', AuthMiddleware.authenticate, userController.getUsers);
router.post('/abonent-service/store', abonentServiceController.store);
router.get('/api/listServices', abonentServiceController.getServices);

export default router;
