import { Schema, model, HydratedDocument } from "mongoose";

export interface CommunityPost {
  title: string;
  forum: string;
  forumLabel: string;
  author: string;
  url: string;
  score: number;
  comments: number;
  thumbnail?: string;
  createdAt: Date;
  updatedAt?: Date;
}

const communityPostSchema = new Schema<CommunityPost>(
  {
    title: { type: String, required: true },
    forum: { type: String, required: true, index: true },
    forumLabel: { type: String, required: true },
    author: { type: String, required: true },
    url: { type: String, required: true },
    score: { type: Number, required: true },
    comments: { type: Number, required: true },
    thumbnail: { type: String },
    createdAt: { type: Date, required: true, index: true }
  },
  { timestamps: true }
);

communityPostSchema.index({ forum: 1, createdAt: -1 });

export type CommunityPostDocument = HydratedDocument<CommunityPost>;
export const CommunityPostModel = model<CommunityPost>("CommunityPost", communityPostSchema);
