import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { verifyJWT } from "../middlewares/verifyJWT";

const router = Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.get("/gmail/url", verifyJWT, AuthController.gmailAuthUrl);
router.get("/google/callback", AuthController.gmailCallback);

export default router;
