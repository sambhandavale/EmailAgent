import type { ObjectId } from "mongodb";

export interface User {
  _id?: string;
  googleId: string;
  email: string;
  name: string;
  tokens: {
    access_token: string;
    refresh_token: string;
    scope: string;
    token_type: string;
    expiry_date: number;
  };
  scopes: string[];
  createdAt: Date;
}

export interface Email {
  _id?: ObjectId;
  userId: string;
  googleMsgId: string;
  sender: string;
  subject: string;
  content: string;
  timestamp: Date;
  priority?: number;
  status: 'new' | 'processed';
  metadata?: Record<string, any>;
  createdAt: Date;
}
