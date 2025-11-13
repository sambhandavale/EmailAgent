import { google } from "googleapis";
import { getAuthClient } from "../../core/oauth";

export async function getGmailClient(userId: string) {
  const auth = await getAuthClient(userId);
  return google.gmail({ version: "v1", auth });
}
