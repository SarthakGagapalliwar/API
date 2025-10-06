import express from 'express';
import globalErrorhandler from './middleware/globalErrorHandler';

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Routes
app.get('/', (req, res, next) => {
    res.json({ message: "Welcome to elib APIs" });
});

// Global error handler
app.use(globalErrorhandler)

export default app;
