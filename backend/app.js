import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.route.js';
import personalRoutes from './routes/personalRoute.js';
import experienceRoutes from './routes/experienceRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import userinfoRoutes from './routes/userInfoRoutes.js'
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(path.resolve(), 'uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/personal', personalRoutes);
app.use('/api/experience', experienceRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/user-info', userinfoRoutes);

app.listen(5000, () => console.log('Server running on port 5000'));
