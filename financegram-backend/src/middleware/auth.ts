import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserModel, UserDocument } from "../models/User";

export interface AuthenticatedRequest extends Request {
  user?: UserDocument;
}

const JWT_SECRET = process.env.JWT_SECRET ?? "supersecretjwtkey";

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await UserModel.findById(payload.userId);

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}
export default authMiddleware;
