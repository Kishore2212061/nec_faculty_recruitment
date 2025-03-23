import express from 'express';
import { saveUserInfo,getUserInfo } from '../controllers/userInfoController.js';

const router = express.Router();

router.post('/:userId', saveUserInfo);
router.get('/:userId', getUserInfo);

export default router;
