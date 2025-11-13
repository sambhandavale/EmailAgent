import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { google } from "googleapis";
import { User, IUser } from "../models/User";
import { JWT_SECRET } from "../core/config";

export class AuthService {

  async registerPlatformUser(name: string, email: string, password: string) {
    const existing = await User.findOne({ email });
    if (existing) throw new Error("User already exists");

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ name, email, passwordHash });
    await user.save();

    return user._id;
  }

  async loginPlatformUser(email: string, password: string) {
    const user = await User.findOne({ email });
    if (!user || !user.passwordHash) throw new Error("Invalid credentials");

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) throw new Error("Invalid credentials");

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });
    return { token, userId: user._id };
  }

  async generateGmailAuthUrl(userId: string) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/gmail.send",
        "https://www.googleapis.com/auth/gmail.modify"
      ],
      prompt: "consent",
      state: userId,
    });

    return url;
  }

  async handleGmailCallback(code: string, userId: string) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(code);

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const { access_token, refresh_token, scope, token_type, expiry_date } = tokens;

    user.tokens = {
      access_token: access_token!,
      refresh_token: refresh_token!,
      scope: scope!,
      token_type: token_type!,
      expiry_date: expiry_date!,
    };

    await user.save();

    return { success: true };
  }

  async getUserById(userId: string) {
    return await User.findById(userId);
  }

  async getOAuthClient(userId: string) {
    const user = await User.findById(userId);
    if (!user || !user.tokens) throw new Error("Gmail not connected for this user");

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    oauth2Client.setCredentials(user.tokens);
    return oauth2Client;
  }
}
