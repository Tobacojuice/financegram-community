import { MarketQuoteModel } from "../models/MarketQuote";
import { NewsItemModel } from "../models/NewsItem";
import { TalentJobModel } from "../models/TalentJob";
import { CommunityPostModel } from "../models/CommunityPost";
import { LearningCertificationModel } from "../models/LearningCertification";

const PROVIDER = "simulated";

export async function refreshMarketQuotes(): Promise<void> {
  try {
    const now = new Date();
    const quotes = [
      {
        symbol: "AAPL",
        label: "Apple Inc.",
        price: 197.22,
        change: 1.05,
        changePercent: 0.54,
        previousClose: 196.17,
        volume: 74200000,
        currency: "USD",
        updatedAt: now,
        provider: PROVIDER
      },
      {
        symbol: "MSFT",
        label: "Microsoft Corporation",
        price: 428.15,
        change: -0.82,
        changePercent: -0.19,
        previousClose: 428.97,
        volume: 32400000,
        currency: "USD",
        updatedAt: now,
        provider: PROVIDER
      }
    ];

    await Promise.all(
      quotes.map((quote) =>
        MarketQuoteModel.findOneAndUpdate({ symbol: quote.symbol }, quote, {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true
        })
      )
    );

    console.log("Market quotes refreshed");
  } catch (error) {
    console.error("Failed refreshing market quotes", error);
  }
}

export async function refreshNewsItems(): Promise<void> {
  try {
    const now = new Date();
    const articles = [
      {
        title: "Financegram launches new terminal app",
        summary: "Financegram introduces a new community terminal for market collaboration.",
        url: "https://financegram.com/news/launch",
        source: "Financegram News",
        tickers: ["FGCM"],
        sentiment: "positive" as const,
        thumbnailUrl: undefined,
        provider: PROVIDER,
        publishedAt: now
      }
    ];

    await Promise.all(
      articles.map((article) =>
        NewsItemModel.findOneAndUpdate({ url: article.url }, { ...article, updatedAt: now }, {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true
        })
      )
    );

    console.log("News items refreshed");
  } catch (error) {
    console.error("Failed refreshing news items", error);
  }
}

export async function refreshTalentJobs(): Promise<void> {
  try {
    const now = new Date();
    const jobs = [
      {
        title: "Senior Financial Analyst",
        company: "Financegram",
        location: "Remote",
        url: "https://financegram.com/jobs/senior-financial-analyst",
        remote: true,
        tags: ["analytics", "finance"],
        postedAt: now
      }
    ];

    await Promise.all(
      jobs.map((job) =>
        TalentJobModel.findOneAndUpdate({ url: job.url }, { ...job, updatedAt: now }, {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true
        })
      )
    );

    console.log("Talent jobs refreshed");
  } catch (error) {
    console.error("Failed refreshing talent jobs", error);
  }
}

export async function refreshCommunityPosts(): Promise<void> {
  try {
    const now = new Date();
    const posts = [
      {
        title: "How are you hedging ahead of earnings?",
        forum: "global",
        forumLabel: "Global Community",
        author: "analyst_jane",
        url: "https://community.financegram.com/posts/hedging-earnings",
        score: 128,
        comments: 34,
        thumbnail: undefined,
        createdAt: now
      }
    ];

    await Promise.all(
      posts.map((post) =>
        CommunityPostModel.findOneAndUpdate({ url: post.url }, { ...post, updatedAt: now }, {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true
        })
      )
    );

    console.log("Community posts refreshed");
  } catch (error) {
    console.error("Failed refreshing community posts", error);
  }
}

export async function refreshLearningCertifications(): Promise<void> {
  try {
    const now = new Date();
    const certifications = [
      {
        title: "Advanced Options Strategies",
        provider: "Financegram Academy",
        duration: "6 weeks",
        format: "Self-paced",
        costRange: "$199",
        description: "Deep dive into advanced options trading approaches.",
        url: "https://financegram.com/certifications/advanced-options",
        imageUrl: undefined
      }
    ];

    await Promise.all(
      certifications.map((certification) =>
        LearningCertificationModel.findOneAndUpdate({ url: certification.url }, { ...certification, updatedAt: now }, {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true
        })
      )
    );

    console.log("Learning certifications refreshed");
  } catch (error) {
    console.error("Failed refreshing learning certifications", error);
  }
}
