import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { upload } from '../../middleware/multer.js';
import * as photosController from './photos.controller.js';

const router = Router({ mergeParams: true }); // needed for :eventId from parent

router.use(authMiddleware);

router.post('/', upload.single('photo'), photosController.uploadPhoto);
router.get('/my', photosController.getMyPhotos);
router.get('/', photosController.getEventPhotos);
router.delete('/:photoId', photosController.deletePhoto);

export default router;