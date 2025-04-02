// routes/marksRoutes.js
import express from 'express';
import { calculateUserMarks, getUserMarks } from '../controllers/marksController.js';

const router = express.Router();

router.post('/calculate/:userId', calculateUserMarks);
router.get('/:userId', getUserMarks);

export default router;