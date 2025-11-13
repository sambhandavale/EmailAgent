import { Router } from "express";
import { sendEmail } from "./send";
import { processInbox } from "./read";
import { watchInbox } from "./watch";

const router = Router();

router.post("/", async (req, res) => {
  const { action, data } = req.body;

  try {
    switch (action) {
      case "send":
        return res.json(await sendEmail(data));
      case "read":
        return res.json(await processInbox());
      case "watch":
        return res.json(await watchInbox(data.userId));
      default:
        return res.status(400).send("Invalid action");
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
