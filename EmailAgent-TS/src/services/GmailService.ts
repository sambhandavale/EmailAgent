import { google } from "googleapis";
import { AuthService } from "./AuthService";
import { logger } from "../core/logger";
import fs from "fs"

export class GmailService {
  private authService = new AuthService();

  async sendEmail(
    userId: string,
    to: string,
    subject: string,
    body: string,
    file?: Express.Multer.File
  ) {
    const auth = await this.authService.getOAuthClient(userId);
    const gmail = google.gmail({ version: "v1", auth });

    if (!file) {
      // 📨 simple text email
      const message = [
        `From: me`,
        `To: ${to}`,
        `Subject: ${subject}`,
        ``,
        body,
      ].join("\n");

      const encodedMessage = Buffer.from(message)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      const res = await gmail.users.messages.send({
        userId: "me",
        requestBody: { raw: encodedMessage },
      });

      return res.data;
    }

    // 📎 email with attachment
    const boundary = "foo_bar_baz";
    const fileData = fs.readFileSync(file.path).toString("base64");

    const messageParts = [
      `From: me`,
      `To: ${to}`,
      `Subject: ${subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: multipart/mixed; boundary=${boundary}`,
      ``,
      `--${boundary}`,
      `Content-Type: text/plain; charset="UTF-8"`,
      ``,
      body,
      ``,
      `--${boundary}`,
      `Content-Type: ${file.mimetype}`,
      `Content-Disposition: attachment; filename="${file.originalname}"`,
      `Content-Transfer-Encoding: base64`,
      ``,
      fileData,
      ``,
      `--${boundary}--`,
    ];

    const encodedMessage = Buffer.from(messageParts.join("\n"))
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const res = await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw: encodedMessage },
    });

    fs.unlinkSync(file.path); // 🧹 clean up local file

    return res.data;
  }

  // Read last N emails
  async readInbox(userId: string, maxResults = 5, pageToken?: string) {
    const auth = await this.authService.getOAuthClient(userId);
    const gmail = google.gmail({ version: "v1", auth });

    // Fetch emails with optional pageToken
    const res = await gmail.users.messages.list({
      userId: "me",
      maxResults,
      pageToken, // <-- for pagination
    });

    const messages = res.data.messages || [];
    const result: any[] = [];

    for (const msg of messages) {
      const full = await gmail.users.messages.get({ userId: "me", id: msg.id });
      const from = full.data.payload?.headers?.find(h => h.name === "From")?.value;
      const subject = full.data.payload?.headers?.find(h => h.name === "Subject")?.value;
      result.push({ id: msg.id, from, subject });
      logger.info(`Email from ${from} | Subject: ${subject}`);
    }

    return {
      emails: result,
      nextPageToken: res.data.nextPageToken || null, // <-- include next page token
      resultSizeEstimate: res.data.resultSizeEstimate,
    };
  }


  // Watch inbox for new emails (Pub/Sub or Polling based on ENV)
  async watchInbox(userId: string) {
    const mode = process.env.GMAIL_WATCH_MODE || "polling"; // 'pubsub' | 'polling'
    logger.info(`Starting Gmail watch in mode: ${mode}`);

    if (mode === "pubsub") {
      return await this.startPubSubWatch(userId);
    } else {
      return await this.startPollingWatch(userId);
    }
  }

  // --- Option 1: Use Gmail Pub/Sub watch (Production) ---
  private async startPubSubWatch(userId: string) {
    const topicName = process.env.GMAIL_PUBSUB_TOPIC;

    if (!topicName) {
      throw new Error("GMAIL_PUBSUB_TOPIC not set in environment");
    }

    const auth = await this.authService.getOAuthClient(userId);
    const gmail = google.gmail({ version: "v1", auth });

    const response = await gmail.users.watch({
      userId: "me",
      requestBody: {
        topicName, // e.g. projects/<project-id>/topics/<topic-name>
      },
    });

    logger.info(`Started Gmail Pub/Sub watch for user ${userId}`);
    return { status: "watch started (pubsub)", data: response.data };
  }

  // --- Option 2: Polling fallback (Local dev/testing) ---
  private async startPollingWatch(userId: string) {
    const intervalMs = Number(process.env.GMAIL_POLL_INTERVAL_MS || 60000);
    logger.info(`Starting Gmail polling every ${intervalMs / 1000}s for user ${userId}`);

    const poll = async () => {
      try {
        const emails = await this.readInbox(userId, 5);
        logger.info(`Polled ${emails.emails.length} latest emails`);
      } catch (err) {
        logger.error(`Polling failed for user ${userId}:`, err);
      }
    };

    // Run immediately, then on interval
    await poll();
    setInterval(poll, intervalMs);

    return { status: "watch started (polling)", interval: intervalMs };
  }
}
