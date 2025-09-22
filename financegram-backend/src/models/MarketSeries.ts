import { Schema, model, HydratedDocument } from "mongoose";

export interface SeriesPoint {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketSeries {
  symbol: string;
  interval: "1d" | "1h" | "15m" | "1w";
  data: SeriesPoint[];
  provider?: string;
  lastRefreshed?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const seriesPointSchema = new Schema<SeriesPoint>(
  {
    timestamp: { type: Date, required: true },
    open: { type: Number, required: true },
    high: { type: Number, required: true },
    low: { type: Number, required: true },
    close: { type: Number, required: true },
    volume: { type: Number, required: true }
  },
  { _id: false }
);

const marketSeriesSchema = new Schema<MarketSeries>(
  {
    symbol: { type: String, required: true, uppercase: true, index: true },
    interval: { type: String, required: true, enum: ["1d", "1h", "15m", "1w"] },
    data: { type: [seriesPointSchema], default: [] },
    provider: { type: String, default: "simulated" },
    lastRefreshed: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

marketSeriesSchema.index({ symbol: 1, interval: 1 }, { unique: true });

export type MarketSeriesDocument = HydratedDocument<MarketSeries>;
export const MarketSeriesModel = model<MarketSeries>("MarketSeries", marketSeriesSchema);
