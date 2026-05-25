import {Router} from 'express';
import {authMiddleware} from '../../middleware/auth.middleware.js';
import * as eventController from './event.controller.js';

const router = Router();

router.use(authMiddleware);

router.post('/', eventController.createEvent);
router.post('/join', eventController.joinEvent);
router.get('/my', eventController.getMyEvents);
router.get('/:id', eventController.getEventById);
router.delete('/:id', eventController.deleteEvent);

export default router;