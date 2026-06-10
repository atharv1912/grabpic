import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { upload } from '../../middleware/multer.js';
import { getMe, uploadSelfie } from './user.controller.js';

const router = Router();

router.get('/me', authMiddleware, getMe);
router.put('/selfie', authMiddleware, upload.single('photo'), uploadSelfie);

export default router;
