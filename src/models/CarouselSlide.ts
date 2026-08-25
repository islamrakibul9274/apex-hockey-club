import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICarouselSlide extends Document {
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  order: number;
}

const CarouselSlideSchema = new Schema<ICarouselSlide>(
  {
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    description: { type: String, required: true },
    badge: { type: String, required: true },
    image: { type: String, required: true },
    ctaText: { type: String, required: true },
    ctaLink: { type: String, required: true },
    secondaryCtaText: { type: String },
    secondaryCtaLink: { type: String },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default (mongoose.models.CarouselSlide as Model<ICarouselSlide>) ||
  mongoose.model<ICarouselSlide>("CarouselSlide", CarouselSlideSchema);
