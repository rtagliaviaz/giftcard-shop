import express from 'express';
import {apiRoutes} from './routes';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.send('Gift Card Shop API is running');
});

export default app;