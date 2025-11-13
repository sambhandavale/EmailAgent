import { Workflow } from "../models/Workflow";
import { logger } from "../core/logger";
import { GmailService } from "./GmailService";
import { Cron } from "croner";

const emailService = new GmailService();

export class WorkflowService {
  // Create workflow with timezone support
  async createWorkflow(userId: string, name: string, trigger: any, actions: any[], timezone: string = "UTC") {
    if (!trigger?.expression) throw new Error("Missing cron expression");

    let nextRun: Date | null;
    try {
      console.log("Parsing cron expression:", trigger.expression, "Timezone:", timezone);
      
      // FIX #1: Changed 'tz' to 'timezone'
      const interval = new Cron(trigger.expression, { timezone: timezone });
      
      // FIX #2: Changed 'next()' to 'nextRun()'
      nextRun = interval.nextRun(); 

      if (!nextRun) {
        throw new Error("Cron expression will never run.");
      }

    } catch (err: any) {
      console.error("Cron parse error:", err);
      throw new Error("Invalid cron expression: " + err.message);
    }

    const workflow = new Workflow({
      userId,
      name,
      trigger,
      actions,
      active: true,
      nextRun,
      timezone
    });

    await workflow.save();
    logger.info(`🧠 Created workflow for user ${userId}: ${name} (TimeZone: ${timezone})`);
    return workflow;
  }

  async getUserWorkflows(userId: string) {
    return await Workflow.find({ userId });
  }

  // Run pending workflows respecting user timezone
  async runPendingWorkflows() {
    const now = new Date();
    const workflows = await Workflow.find({ active: true, nextRun: { $lte: now } });

    for (const wf of workflows) {
      try {
        logger.info(`⚙️ Running workflow: ${wf.name} (Timezone: ${wf.timezone})`);

        for (const action of wf.actions) {
          if (action.type === "send_email") {
            await emailService.sendEmail(
              wf.userId,
              action.params.to,
              action.params.subject,
              action.params.body
            );
          }
        }

        // FIX #1: Changed 'tz' to 'timezone'
        const interval = new Cron(wf.trigger.expression, { timezone: wf.timezone || "UTC" });
        
        // FIX #2: Changed 'next()' to 'nextRun()'
        wf.nextRun = interval.nextRun(); 
        await wf.save();

      } catch (err: any) {
        logger.error(`❌ Workflow execution failed (${wf.name}): ${err.message}`);
      }
    }
  }
}