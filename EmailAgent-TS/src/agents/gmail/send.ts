import { getGmailClient } from "./auth";

export async function sendEmail({ userId, to, subject, body }: any) {
  const gmail = await getGmailClient(userId);

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
    requestBody: {
      raw: encodedMessage,
    },
  });

  return res.data;
}
