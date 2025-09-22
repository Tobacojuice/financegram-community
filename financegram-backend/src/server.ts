import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cron from "node-cron";

import { connectDB } from "./config/db";
import authRoutes from "./routes/auth";
import marketRoutes from "./routes/market";
import newsRoutes from "./routes/news";
import jobsRoutes from "./routes/jobs";
import communitiesRoutes from "./routes/communities";
import certificatesRoutes from "./routes/certificates";
import sessionRoutes from "./routes/session";
import {
  refreshMarketQuotes,
  refreshNewsItems,
  refreshTalentJobs,
  refreshCommunityPosts,
  refreshLearningCertifications
} from "./services/ingestion";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT ?? 4000);

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/market", marketRoutes);
app.use("/news", newsRoutes);
app.use("/jobs", jobsRoutes);
app.use("/communities", communitiesRoutes);
app.use("/certificates", certificatesRoutes);
app.use("/session", sessionRoutes);

app.get("/", (_req, res) => res.send("Financegram Backend API"));

async function start(): Promise<void> {
  try {
    await connectDB();

    await Promise.all([
      refreshMarketQuotes(),
      refreshNewsItems(),
      refreshTalentJobs(),
      refreshCommunityPosts(),
      refreshLearningCertifications()
    ]);

    cron.schedule("*/5 * * * *", async () => {
      console.log("Running scheduled ingestion jobs...");
      await refreshMarketQuotes();
      await refreshNewsItems();
      await refreshTalentJobs();
      await refreshCommunityPosts();
      await refreshLearningCertifications();
    });

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

start();
