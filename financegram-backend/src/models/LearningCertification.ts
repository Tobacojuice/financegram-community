import { Schema, model, HydratedDocument } from "mongoose";

export interface LearningCertification {
  title: string;
  provider: string;
  duration: string;
  format: string;
  costRange: string;
  description: string;
  url: string;
  imageUrl?: string;
  updatedAt: Date;
  createdAt?: Date;
}

const learningCertificationSchema = new Schema<LearningCertification>(
  {
    title: { type: String, required: true },
    provider: { type: String, required: true },
    duration: { type: String, required: true },
    format: { type: String, required: true },
    costRange: { type: String, required: true },
    description: { type: String, required: true },
    url: { type: String, required: true },
    imageUrl: { type: String },
    updatedAt: { type: Date, required: true }
  },
  { timestamps: true }
);

learningCertificationSchema.index({ updatedAt: -1 });

export type LearningCertificationDocument = HydratedDocument<LearningCertification>;
export const LearningCertificationModel = model<LearningCertification>(
  "LearningCertification",
  learningCertificationSchema
);
