import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/User";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET ?? "supersecretjwtkey";

router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }

    const existing = await UserModel.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const domain = (email.split("@")[1] ?? "").toLowerCase();
    const communities = new Set<string>(["global"]);

    if (domain === "financegram.com") {
      communities.add("us-east");
    }

    if (domain.endsWith("university.edu")) {
      communities.add("regional");
      communities.add("university-abc");
    }

    const user = new UserModel({
      email,
      username: email.split("@")[0],
      passwordHash,
      communities: Array.from(communities),
      name
    });

    await user.save();

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });

    return res.json({
      token,
      user: {
        email: user.email,
        communities: user.communities,
        username: user.username,
        name: user.name
      }
    });
  } catch (error) {
    console.error("Failed to register user", error);
    return res.status(500).json({ error: "Failed to register" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });
    user.lastLoginAt = new Date();
    await user.save();

    return res.json({
      token,
      user: {
        email: user.email,
        communities: user.communities,
        username: user.username,
        name: user.name
      }
    });
  } catch (error) {
    console.error("Failed to login user", error);
    return res.status(500).json({ error: "Failed to login" });
  }
});

export default router;
