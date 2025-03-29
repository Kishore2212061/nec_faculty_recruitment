import express from 'express';
import { saveCourses,getCourses } from '../controllers/courseController.js';

const router = express.Router();

router.post('/:userId', saveCourses);
router.get('/:userId', getCourses);

export default router;
