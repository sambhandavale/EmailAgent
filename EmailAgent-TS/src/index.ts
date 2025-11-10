import express from 'express';
import dotenv from 'dotenv';
import morgan from "morgan";
import { connectDB } from './db';
import authRoutes from './routes';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use(authRoutes);
app.use(morgan("dev"));

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
