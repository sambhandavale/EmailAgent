import { Request, Response } from "express";
import { AuthService } from "../services/AuthService";

const authService = new AuthService();

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;
      const userId = await authService.registerPlatformUser(name, email, password);
      return res.json({ userId });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await authService.loginPlatformUser(email, password);
      return res.json(result);
    } catch (err: any) {
      return res.status(401).json({ error: err.message });
    }
  }

  static async gmailAuthUrl(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId || req.query.userId;
      if (!userId) return res.status(400).json({ error: "Missing userId" });

      const url = await authService.generateGmailAuthUrl(userId);
      return res.json({ url });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async gmailCallback(req: Request, res: Response) {
    try {
      const { code, state } = req.query as { code: string; state: string };
      if (!code || !state)
        return res.status(400).json({ error: "Missing code or state" });

      const userId = state;
      const result = await authService.handleGmailCallback(code, userId);
      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
}
