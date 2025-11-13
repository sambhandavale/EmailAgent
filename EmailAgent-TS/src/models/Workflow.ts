// models/Workflow.ts
import mongoose from "mongoose";

const workflowSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  trigger: {
    expression: { type: String, required: true },
  },
  actions: [
    {
      type: {
        type: String,
        required: true,
      },
      params: {
        to: String,
        subject: String,
        body: String,
      },
    },
  ],
  active: { type: Boolean, default: true },
  nextRun: { type: Date },
  timezone: { type: String, default: "UTC" }, 
});

export const Workflow = mongoose.model("Workflow", workflowSchema);
