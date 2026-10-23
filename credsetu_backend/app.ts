import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth_routes';
import loanRoutes from './routes/loan_routes';
import { initDb } from './db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json({ limit: '15mb' }));

app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`REQUEST ${req.method} ${req.originalUrl}`);
    next();
});

app.use('/api/auth', authRoutes);
app.use('/api/loans', loanRoutes);

app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/', (req: Request, res: Response) => {
    res.status(200).json({ message: 'Credsetu Money Tracker Backend API is running' });
});

async function startServer() {
    try {
        await initDb();
        const portNumber = Number(PORT) || 8080;
        app.listen(portNumber, '0.0.0.0', () => {
            console.log(`Credsetu server is running on http://0.0.0.0:${portNumber} (accessible via http://10.117.153.123:${portNumber})`);
        });
    } catch (error) {
        console.error('Failed to initialize database, running server anyway with error logging:', error);
        app.listen(PORT, () => {
            console.log(`⚠️ Credsetu server listening on port ${PORT} (Database pending connection)`);
        });
    }
}

startServer();
export default app;
