import { Request, Response } from "express";
import { GmailService } from "../services/GmailService";

const gmailService = new GmailService();

export class GmailController {
  static async sendEmail(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const { to, subject, body } = req.body;
      const file = req.file; // uploaded file via multer

      if (!userId || !to || !subject || !body) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const result = await gmailService.sendEmail(userId, to, subject, body, file);
      return res.json(result);
    } catch (err: any) {
      console.error("Send email error:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  static async readInbox(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const result = await gmailService.readInbox(userId);
      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async watchInbox(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const result = await gmailService.watchInbox(userId);
      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
}
