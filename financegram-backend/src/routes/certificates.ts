import { Router, Request, Response } from "express";
import { LearningCertificationModel } from "../models/LearningCertification";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const certs = await LearningCertificationModel.find().sort({ updatedAt: -1 }).limit(50);
    return res.json({ certifications: certs });
  } catch (error) {
    console.error("Failed to fetch certificates", error);
    return res.status(500).json({ error: "Failed to fetch certificates" });
  }
});

export default router;
