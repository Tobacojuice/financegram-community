import { Router, Request, Response } from "express";
import { MarketQuoteModel } from "../models/MarketQuote";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const quotes = await MarketQuoteModel.find().sort({ updatedAt: -1 }).limit(50);
    return res.json(quotes);
  } catch (error) {
    console.error("Failed to fetch market quotes", error);
    return res.status(500).json({ error: "Failed to fetch market quotes" });
  }
});

export default router;
