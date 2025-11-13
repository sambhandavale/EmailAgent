import cron from "node-cron";
import { logger } from "./logger";
import { WorkflowService } from "../services/WorkflowService";

export function startScheduler() {
  const workflowService = new WorkflowService();

  cron.schedule("*/2 * * * *", async () => {
    logger.info("Scheduler running: checking workflows...");
    try {
      await workflowService.runPendingWorkflows();
    } catch (err) {
      logger.error("Workflow execution failed", err);
    }
  });
}