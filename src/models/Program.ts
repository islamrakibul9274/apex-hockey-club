import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProgram extends Document {
  title: string;
  category: string;
  ageGroup: string;
  duration: string;
  price: number;
  schedule: string;
  image: string;
  coach: string;
  spotsLeft: number;
  description: string;
  features: string[];
  createdAt: Date;
}

const ProgramSchema = new Schema<IProgram>(
  {
    title: { type: String, required: true },
    category: { type: String, required: true },
    ageGroup: { type: String, required: true },
    duration: { type: String, required: true },
    price: { type: Number, required: true },
    schedule: { type: String, required: true },
    image: { type: String, required: true },
    coach: { type: String, required: true },
    spotsLeft: { type: Number, default: 10 },
    description: { type: String, required: true },
    features: [{ type: String }],
  },
  { timestamps: true }
);

export default (mongoose.models.Program as Model<IProgram>) || mongoose.model<IProgram>("Program", ProgramSchema);
