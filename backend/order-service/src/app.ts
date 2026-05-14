import express from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler';
import orderRoutes from './routes/orders';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/orders', orderRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use(errorHandler);

export default app;