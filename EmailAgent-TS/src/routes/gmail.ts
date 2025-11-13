import { Router } from "express";
import { GmailController } from "../controllers/GmailController";
import { verifyJWT } from "../middlewares/verifyJWT";
import { upload } from "../middlewares/upload";

const router = Router();

// All Gmail actions require authentication
router.post("/send", verifyJWT, upload.single("file"), GmailController.sendEmail);
router.post("/read", verifyJWT, GmailController.readInbox);
router.post("/watch", verifyJWT, GmailController.watchInbox);

export default router;
