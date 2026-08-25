import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProduct extends Document {
  title: string;
  category: string;
  price: number;
  rating: number;
  reviewsCount: number;
  views: number;
  likes: number;
  inStock: boolean;
  image: string;
  description: string;
  features: string[];
  delivery: string;
  createdAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    rating: { type: Number, default: 5.0 },
    reviewsCount: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    inStock: { type: Boolean, default: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    features: [{ type: String }],
    delivery: { type: String, default: "Free Delivery" },
  },
  { timestamps: true }
);

export default (mongoose.models.Product as Model<IProduct>) || mongoose.model<IProduct>("Product", ProductSchema);
