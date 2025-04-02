import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.route.js';
import personalRoutes from './routes/personalRoute.js';
import experienceRoutes from './routes/experienceRoutes.js';
import educationRoutes from './routes/educationRoutes.js';
import phdRoutes from './routes/phdRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import userinfoRoutes from './routes/userInfoRoutes.js';
import publicationRoutes from './routes/publicationRoutes.js';
import marksRoutes from './routes/marksRoutes.js';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(path.resolve(), 'uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/personal', personalRoutes);
app.use("/api/education", educationRoutes);
app.use("/api/phd", phdRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/user-info', userinfoRoutes);
app.use('/api/publications',publicationRoutes);
app.use('/api/', experienceRoutes);
app.use('/api/marks', marksRoutes);  //

app.listen(5000, () => console.log('Server running on port 5000'));
