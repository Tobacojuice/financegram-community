import { Router, Response } from "express";
import authMiddleware, { AuthenticatedRequest } from "../middleware/auth";

const router = Router();

router.get("/", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  return res.json({
    user: {
      email: user.email,
      username: user.username,
      communities: user.communities,
      name: user.name
    }
  });
});

export default router;
