import express from 'express';
import { register, login ,updateUserSubmission} from '../controllers/auth.controller.js';

const router = express.Router();
router.post('/register', register);
router.post('/login', login);
router.put('/submission/:userId',updateUserSubmission);

export default router;
