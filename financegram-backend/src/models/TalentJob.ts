import { Schema, model, HydratedDocument } from "mongoose";

export interface TalentJob {
  title: string;
  company: string;
  location: string;
  url: string;
  remote: boolean;
  tags?: string[];
  postedAt: Date;
  updatedAt?: Date;
}

const talentJobSchema = new Schema<TalentJob>(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    url: { type: String, required: true },
    remote: { type: Boolean, required: true },
    tags: { type: [String], default: [] },
    postedAt: { type: Date, required: true, index: true }
  },
  { timestamps: true }
);

talentJobSchema.index({ postedAt: -1 });

talentJobSchema.index({ company: 1, title: 1 });

export type TalentJobDocument = HydratedDocument<TalentJob>;
export const TalentJobModel = model<TalentJob>("TalentJob", talentJobSchema);
