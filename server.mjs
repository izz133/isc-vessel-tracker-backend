// server connection
import dotenv from 'dotenv';
dotenv.config();
console.log(process.env.NODE_ENV);

// Imports
import express from 'express';
import 'express-async-errors'; //require

import cors from 'cors';
import path from 'path';
import { logger } from './middleware/logger.mjs';
import { router as rootRouter } from './routes/root.mjs';
import __dirname from './middleware/dirname.mjs';
import { errorHandler } from './middleware/errorHandler.mjs';
import cookieParser from 'cookie-parser';
import { corsOptions } from './config/corsOptions.mjs';
import { connectDB } from './config/dbConn.mjs';
import mongoose from 'mongoose';
import { logEvents } from './middleware/logger.mjs';

// Routes
import userRoutes from './routes/userRoutes.mjs';
import noteRoutes from './routes/noteRoutes.mjs';
import authRoutes from './routes/authRoutes.mjs';
import vesselRoutes from './routes/vesselRoutes.mjs';

// Set the port
const PORT = process.env.PORT || 3500

// Connec DB function
connectDB()

// Create an Express app instance
const app = express()

// Parse JSON
app.use(express.json())

// Middleware
app.use(logger)

// Enable CORS
app.use(cors(corsOptions))

// Parse cookie 
app.use(cookieParser())

// Serve static files and set up routes
app.use('/', express.static(path.join(__dirname, './public')))
app.use('/', rootRouter)
app.use('/auth', authRoutes)
app.use('/users', userRoutes)
app.use('/notes', noteRoutes)
app.use('/vessels', vesselRoutes)

// Error handling for 404 (Not Found)
app.all('*', (req, res) => {
  res.status(404);
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, '../views', '404.html'));
  } else if (req.accepts('json')) {
    res.json({ message: '404 Not Found' });
  } else {
    res.type('txt').send('404 Not Found');
  }
});

// Middleware logEvent
app.use(errorHandler)

// Start the Express server + error log
mongoose.connection.once('open', () => {
  console.log('connected to MongoDB')
  app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
  });
})

mongoose.connection.on('error', err => {
  console.log(err)
  logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
  'mongoErrLog')
})