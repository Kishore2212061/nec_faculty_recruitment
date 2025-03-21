import express from 'express';
import { saveExperience, getExperience } from '../controllers/experienceController.js';

const router = express.Router();

router.post('/experience/:userId', saveExperience);
router.get('/experience/:userId', getExperience);

export default router;
