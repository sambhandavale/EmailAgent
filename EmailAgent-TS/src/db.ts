import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

let db: Db;

export async function connectDB(): Promise<Db> {
  if (db) return db;
  const client = new MongoClient(process.env.MONGODB_URI!);
  await client.connect();
  db = client.db("emailagent");
  console.log('Connected to MongoDB');
  return db;
}
