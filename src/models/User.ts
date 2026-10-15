import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  role: "user" | "member" | "vip" | "admin";
  phone?: string;
  membershipPlan?: string;
  membershipExpires?: Date;
  address?: {
    street?: string;
    city?: string;
    zip?: string;
    country?: string;
  };
  notificationsEnabled: boolean;
  /** SHA-256 hash of a password-reset token. Never the raw token. */
  passwordResetHash?: string;
  passwordResetExpires?: Date;
  passwordChangedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: false },
    avatar: { type: String, default: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" },
    role: { type: String, enum: ["user", "member", "vip", "admin"], default: "user" },
    phone: { type: String, default: "" },
    membershipPlan: { type: String, default: "Free Member" },
    membershipExpires: { type: Date },
    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      zip: { type: String, default: "" },
      country: { type: String, default: "" },
    },
    notificationsEnabled: { type: Boolean, default: true },
    passwordResetHash: { type: String, default: undefined, select: false },
    passwordResetExpires: { type: Date, default: undefined, select: false },
    passwordChangedAt: { type: Date, default: undefined },
  },
  { timestamps: true }
);

/**
 * Reset fields are `select: false` so they can never leak into a query that
 * forgets to project them away.
 */
UserSchema.index({ passwordResetHash: 1 });

export default (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>("User", UserSchema);
