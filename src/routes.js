import { Router } from 'express';
import multer from 'multer';
import UserController from './app/controllers/UserController';
import multerConfig from './config/multer';
import SessionController from './app/controllers/SessionController';
import authMiddleware from './app/middlewares/auth';
import ScheduleController from './app/controllers/ScheduleController';

const routes = new Router();
const upload = multer(multerConfig);

// signUp
routes.post(
  '/users',
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'certified', maxCount: 1 },
    { name: 'rg', maxCount: 1 },
  ]),
  UserController.store
);

// signIn
routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

// create schedules
routes.get('/schedules', ScheduleController.index);
routes.post('/schedules', ScheduleController.store);
routes.delete('/schedules/:id', ScheduleController.delete);

// update user
routes.put(
  '/users',
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'certified', maxCount: 1 },
    { name: 'rg', maxCount: 1 },
  ]),
  UserController.update
);

export default routes;
