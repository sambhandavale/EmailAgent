import { Request, Response } from "express";
import { WorkflowService } from "../services/WorkflowService";

const workflowService = new WorkflowService();

export class WorkflowController {
  static async create(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const timezone = (req.headers["x-timezone"] as string) || "UTC";
      const { name, trigger, actions } = req.body;

      const workflow = await workflowService.createWorkflow(userId, name, trigger, actions, timezone);
      res.json(workflow);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async getUserWorkflows(req: Request, res: Response) {
    try {
      const { userId } = req.query;
      const workflows = await workflowService.getUserWorkflows(userId as string);
      res.json({ success: true, workflows });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async runManual(req: Request, res: Response) {
    try {
      await workflowService.runPendingWorkflows();
      res.json({ status: "Workflows executed" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
