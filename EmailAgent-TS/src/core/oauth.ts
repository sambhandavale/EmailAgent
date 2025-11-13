import { google } from "googleapis";
import { ObjectId } from "mongodb";
import { connectDB } from "./db";

export async function getAuthClient(userId: string) {
  const db = await connectDB();
  const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  if (user && user.tokens) oauth2Client.setCredentials(user.tokens);
  return oauth2Client;
}
