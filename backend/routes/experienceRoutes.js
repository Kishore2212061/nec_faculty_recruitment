import express from 'express';
import { saveExperience, getExperience } from '../controllers/experienceController.js';

const router = express.Router();

router.post('/:userId', saveExperience);
router.get('/:userId', getExperience);

export default router;
