import express from 'express';
import {apiRoutes} from './routes';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors({
  origin: [process.env.CLIENT_URL as string],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.send('Gift Card Shop API is running');
});

export default app;