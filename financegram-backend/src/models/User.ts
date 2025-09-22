import { Schema, model, HydratedDocument } from "mongoose";

export interface User {
  username: string;
  email: string;
  passwordHash: string;
  roles: string[];
  communities: string[];
  name?: string;
  bio?: string;
  avatarUrl?: string;
  headline?: string;
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<User>(
  {
    username: { type: String, required: true, unique: true, minlength: 3, maxlength: 32, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    roles: { type: [String], default: ["member"], enum: ["member", "moderator", "admin", "analyst"] },
    communities: { type: [String], default: ["global"] },
    name: { type: String },
    bio: { type: String, maxlength: 500 },
    avatarUrl: { type: String },
    headline: { type: String, maxlength: 120 },
    lastLoginAt: { type: Date }
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });

export type UserDocument = HydratedDocument<User>;
export const UserModel = model<User>("User", userSchema);
