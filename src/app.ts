import express from 'express';
import globalErrorhandler from './middleware/globalErrorHandler';
import userRouter from './user/userRouter';
import bookRouter from './book/bookRouter';
import cors from 'cors'
import { config } from './config/config';

const app = express();

app.use(cors({
    origin:config.frontendDomain,
}))
// Middleware to parse JSON
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.json({ message: "Welcome to elib APIs" });
});

app.use('/api/users',userRouter)
app.use('/api/books',bookRouter)

// Global error handler
app.use(globalErrorhandler)

export default app;
