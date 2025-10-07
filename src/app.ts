import express from 'express';
import globalErrorhandler from './middleware/globalErrorHandler';
import userRouter from './user/userRouter';

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.json({ message: "Welcome to elib APIs" });
});

app.use('/api/users',userRouter)

// Global error handler
app.use(globalErrorhandler)

export default app;
