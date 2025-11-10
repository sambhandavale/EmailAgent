import { google } from 'googleapis';
import type { Email, User } from './types.js';
import { connectDB } from './db.js';
import { parseGmailMessage } from './utils.js';

const POLL_INTERVAL_MS = 2 * 60 * 1000;

async function processUserEmails(user: User) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  oauth2Client.setCredentials(user.tokens);

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  const res = await gmail.users.messages.list({
    userId: 'me',
    q: 'is:unread',
    maxResults: 10
  });

  const messages = res.data.messages || [];
  const db = await connectDB();

  for (const m of messages) {
    const msgData = await gmail.users.messages.get({ userId: 'me', id: m.id!, format: 'full' });
    const parsed = parseGmailMessage(msgData.data);

    const emailDoc: Email = {
      userId: user._id!,
      googleMsgId: m.id!,
      sender: parsed.from,
      subject: parsed.subject,
      content: parsed.body,
      timestamp: new Date(parsed.date),
      status: 'new',
      createdAt: new Date(),
      metadata: parsed.metadata
    };

    await db.collection('emails').insertOne(emailDoc);

    // mark as read
    await gmail.users.messages.modify({ 
        userId: 'me', 
        id: m.id!, 
        requestBody: { 
            removeLabelIds: ['UNREAD'] 
        } 
    });
  }
}

async function startDaemon() {
  const db = await connectDB();

  setInterval(async () => {
    const users = await db.collection<User>('users')
    .find({ 'tokens.refresh_token': { $exists: true } })
    .toArray();
    
    for (const user of users) {
      try {
        await processUserEmails(user as User);
      } catch (err) {
        console.error('Error processing emails for user', user.email, err);
      }
    }
  }, POLL_INTERVAL_MS);
}

startDaemon();
