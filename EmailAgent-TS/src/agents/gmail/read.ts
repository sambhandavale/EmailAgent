import { getGmailClient } from "./auth";
import { logger } from "../../core/logger";

export async function processInbox() {
  const userId = "YOUR_TEST_USER_ID";
  const gmail = await getGmailClient(userId);

  const res = await gmail.users.messages.list({ userId: "me", maxResults: 5 });
  const messages = res.data.messages || [];

  for (const msg of messages) {
    const full = await gmail.users.messages.get({ userId: "me", id: msg.id });
    logger.info(`Email from ${full.data.payload?.headers?.find(h => h.name === "From")?.value}`);
  }
}
