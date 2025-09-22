import { Router, Request, Response } from "express";
import { TalentJobModel } from "../models/TalentJob";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const jobs = await TalentJobModel.find().sort({ postedAt: -1 }).limit(20);
    return res.json(jobs);
  } catch (error) {
    console.error("Failed to fetch jobs", error);
    return res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

export default router;
