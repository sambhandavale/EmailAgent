import express from "express"
import { google } from "googleapis"
import type { User } from "./types";
import { connectDB } from "./db";
import { ObjectId } from "mongodb";
 
const router = express.Router()

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
)

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
];

// redirect to google consent 
router.get('/auth/google', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES
  });
  res.redirect(url);
});

// oauth callback to store authenticated users - call after google consent
router.get('/auth/google/callback', async (req, res) => {
  const code = req.query.code as string;
  if (!code) return res.status(400).send('No code provided');

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: profile } = await oauth2.userinfo.get();

    console.log("Received Google profile:", profile);
    console.log("Connecting to DB...");
    const db = await connectDB();
    console.log("Connected! Writing user...");
    const user: User = {
      googleId: profile.id!,
      email: profile.email!,
      name: profile.name!,
      tokens: tokens as any,
      scopes: SCOPES,
      createdAt: new Date()
    };

    await db.collection('users').updateOne(
      { googleId: profile.id },
      { $set: user },
      { upsert: true }
    );
    console.log("User upsert complete");

    res.send('Authentication successful! You can close this tab.');
  } catch (err) {
    console.error(err);
    res.status(500).send('Authentication failed');
  }
});

router.get("/gmail/check", async (req, res) => {
  try {
    const db = await connectDB();
    const userId = req.query.userId as string | undefined;

    const user = userId
      ? await db.collection("users").findOne({ _id: new ObjectId(userId) })
      : await db.collection("users").findOne();

    if (!user) return res.status(404).send("No user found");

    // initialize oauth client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials(user.tokens);

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    const pageToken = req.query.pageToken as string | undefined;

    const response = await gmail.users.messages.list({
      userId: "me",
      labelIds: ["INBOX"],
      maxResults: 5,
      pageToken,
    });

    const messages = response.data.messages || [];
    const nextPageToken = response.data.nextPageToken;

    const emailDetails = [];

    for (const msg of messages) {
      const { data } = await gmail.users.messages.get({
        userId: "me",
        id: msg.id!,
        format: "metadata",
        metadataHeaders: ["From", "Subject", "Date"],
      });

      const headers = data.payload?.headers || [];
      const subject = headers.find((h) => h.name === "Subject")?.value || "";
      const from = headers.find((h) => h.name === "From")?.value || "";
      const date = headers.find((h) => h.name === "Date")?.value || "";
      const snippet = data.snippet || "";

      emailDetails.push({ id: msg.id, from, subject, date, snippet });
    }

    // return emails + nextPageToken(to request next batch)
    res.json({
      emails: emailDetails,
      nextPageToken,
      userId: user._id,
    });
  } catch (err) {
    console.error("Gmail Check Error:", err);
    res.status(500).send("Failed to access Gmail");
  }
});

router.post("/gmail/send", async (req, res) => {
  try {
    const { to, subject, message } = req.body;

    if (!to || !subject || !message) {
      return res.status(400).send("Missing required fields: to, subject, or message");
    }

    const db = await connectDB();
    const user = await db.collection("users").findOne();

    if (!user) return res.status(404).send("No user found");

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials(user.tokens);

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    // Construct email
    const emailLines = [
      `To: ${to}`,
      `Subject: ${subject}`,
      "Content-Type: text/html; charset=utf-8",
      "",
      message,
    ];

    const email = emailLines.join("\n");
    const encodedMessage = Buffer.from(email)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    // Send email
    const result = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage,
      },
    });

    res.json({ success: true, messageId: result.data.id });
  } catch (err) {
    console.error("Error sending email:", err);
    res.status(500).send("Failed to send email");
  }
});

export default router;
