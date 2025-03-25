import express from 'express';
import { savePublications,getPublications } from '../controllers/publicationController.js';

const router = express.Router();

router.post('/:userId', savePublications);
router.get('/:userId', getPublications);

export default router;
