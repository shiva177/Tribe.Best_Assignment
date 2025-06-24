import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import feedbackRoutes from './routes/feedback';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5004;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

app.use('/api/feedback', feedbackRoutes);  // bas router dena hai, function call mat kar

app.get('/', (req, res) => {
  res.send('Backend is running ✅');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
