import { Router, Response } from "express";
import { CommunityPostModel } from "../models/CommunityPost";
import authMiddleware, { AuthenticatedRequest } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

router.get("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const posts = await CommunityPostModel.find({ forum: { $in: user.communities } })
      .sort({ createdAt: -1 })
      .limit(20);

    return res.json(posts);
  } catch (error) {
    console.error("Failed to fetch community posts", error);
    return res.status(500).json({ error: "Failed to fetch community posts" });
  }
});

export default router;
