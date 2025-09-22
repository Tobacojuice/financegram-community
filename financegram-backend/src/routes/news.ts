import { Router, Request, Response } from "express";
import { NewsItemModel } from "../models/NewsItem";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const items = await NewsItemModel.find().sort({ publishedAt: -1 }).limit(20);
    return res.json(items);
  } catch (error) {
    console.error("Failed to fetch news items", error);
    return res.status(500).json({ error: "Failed to fetch news items" });
  }
});

export default router;
