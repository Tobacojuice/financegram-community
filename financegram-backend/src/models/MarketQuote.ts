import { Schema, model, HydratedDocument } from "mongoose";

export interface MarketQuote {
  symbol: string;
  label: string;
  price: number;
  change: number;
  changePercent: number;
  previousClose: number;
  currency: string;
  marketCap?: number;
  volume?: number;
  updatedAt: Date;
  provider?: string;
}

const marketQuoteSchema = new Schema<MarketQuote>(
  {
    symbol: { type: String, required: true, uppercase: true, index: true },
    label: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    change: { type: Number, required: true },
    changePercent: { type: Number, required: true },
    previousClose: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    marketCap: { type: Number },
    volume: { type: Number },
    updatedAt: { type: Date, required: true },
    provider: { type: String, default: "simulated" }
  },
  { timestamps: { createdAt: false, updatedAt: false } }
);

marketQuoteSchema.index({ symbol: 1 }, { unique: true });

export type MarketQuoteDocument = HydratedDocument<MarketQuote>;
export const MarketQuoteModel = model<MarketQuote>("MarketQuote", marketQuoteSchema);
