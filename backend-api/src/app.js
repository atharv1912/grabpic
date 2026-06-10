import express from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/user.routes.js';
import { errorHandler } from './middleware/error.middleware.js';
import eventsRoutes from './modules/events/event.routes.js';
import photosRoutes from './modules/photos/photos.routes.js'; // Import photos routes

import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventsRoutes); 
app.use('/api/events/:eventId/photos', photosRoutes); // Add photos routes


app.use(errorHandler); // must be last


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Gateway running on port ${PORT}`));