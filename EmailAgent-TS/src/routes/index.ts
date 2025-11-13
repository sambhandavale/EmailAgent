import { Response, Express } from "express";
import gmailRoutes from "./gmail"
import workflowRoutes from "./workflow"
import authRoutes from "./auth"

export const routes = (app: Express) =>{
    app.use("/api/gmail", gmailRoutes);
    app.use("/api/workflow", workflowRoutes);
    app.use("/api/auth", authRoutes);
}