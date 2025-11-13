import mongoose, { Schema, Document } from "mongoose";

export interface IEmailLog extends Document {
  userId: string;
  to: string;
  subject: string;
  body: string;
  status: "sent" | "failed";
  error?: string;
}

const EmailLogSchema = new Schema<IEmailLog>(
  {
    userId: { type: String, required: true },
    to: { type: String, required: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    status: { type: String, enum: ["sent", "failed"], required: true },
    error: { type: String },
  },
  { timestamps: true }
);

export const EmailLog = mongoose.model<IEmailLog>("EmailLog", EmailLogSchema);
