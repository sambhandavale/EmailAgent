import { getGmailClient } from "./auth";

export async function watchInbox(userId: string) {
  const gmail = await getGmailClient(userId);

  await gmail.users.watch({
    userId: "me",
    requestBody: {
      topicName: process.env.GMAIL_PUBSUB_TOPIC,
    },
  });

  return { status: "watch started" };
}
