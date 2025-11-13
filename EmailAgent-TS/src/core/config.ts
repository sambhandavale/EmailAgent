import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 5000;
export const MONGO_URI = process.env.MONGODB_URI!;
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!; 
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
export const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;
export const GMAIL_PUBSUB_TOPIC = process.env.GMAIL_PUBSUB_TOPIC!;
export const JWT_SECRET = process.env.JWT_SECRET!;
