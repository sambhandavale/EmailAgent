import { Router } from "express";
import { WorkflowController } from "../controllers/WorkflowController";
import { verifyJWT } from "../middlewares/verifyJWT";

const router = Router();

// Create new workflow (e.g., scheduled daily email)
router.post("/", verifyJWT, WorkflowController.create);

// Get all workflows for a user
router.get("/", verifyJWT, WorkflowController.getUserWorkflows);

// Run all active workflows manually
router.post("/run", WorkflowController.runManual);

export default router;
