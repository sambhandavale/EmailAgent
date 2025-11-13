import mongoose, { Schema, Document, Types } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  tokens?: {
    access_token: string;
    refresh_token: string;
    scope: string;
    token_type: string;
    expiry_date: number;
  };
}

const UserSchema: Schema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String },
    tokens: {
      access_token: String,
      refresh_token: String,
      scope: String,
      token_type: String,
      expiry_date: Number,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);
