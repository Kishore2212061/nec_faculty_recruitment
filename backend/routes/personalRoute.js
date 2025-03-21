import express from 'express';
import multer from 'multer';
import { savePersonal, getPersonal } from '../controllers/personalController.js';

const router = express.Router();

// ✅ Multer config: Store files in memory (buffer) for BLOB storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Route for saving personal data with photo as binary
router.post('/:userId', upload.single('photo'), savePersonal);

// ✅ Route for fetching personal data
router.get('/:userId', getPersonal);

export default router;
