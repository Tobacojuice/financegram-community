import { Schema, model, HydratedDocument } from "mongoose";

export interface NewsItem {
  title: string;
  summary: string;
  url: string;
  source: string;
  tickers: string[];
  publishedAt: Date;
  sentiment?: "positive" | "neutral" | "negative";
  thumbnailUrl?: string;
  provider?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const newsItemSchema = new Schema<NewsItem>(
  {
    title: { type: String, required: true, trim: true },
    summary: { type: String, required: true },
    url: { type: String, required: true, unique: true },
    source: { type: String, required: true },
    tickers: { type: [String], default: [] },
    publishedAt: { type: Date, required: true },
    sentiment: { type: String, enum: ["positive", "neutral", "negative"], default: "neutral" },
    thumbnailUrl: { type: String },
    provider: { type: String, default: "simulated" }
  },
  { timestamps: true }
);

newsItemSchema.index({ publishedAt: -1 });
newsItemSchema.index({ tickers: 1 });

export type NewsItemDocument = HydratedDocument<NewsItem>;
export const NewsItemModel = model<NewsItem>("NewsItem", newsItemSchema);
