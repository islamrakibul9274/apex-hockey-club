import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBlogPost extends Document {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  image: string;
  readTime: string;
  publishedAt: string;
  tags: string[];
  createdAt: Date;
}

const BlogPostSchema = new Schema<IBlogPost>(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, required: true },
    author: {
      name: { type: String, required: true },
      role: { type: String, required: true },
      avatar: { type: String, required: true },
    },
    image: { type: String, required: true },
    readTime: { type: String, default: "5 min read" },
    publishedAt: { type: String, default: "Aug 2026" },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

export default (mongoose.models.BlogPost as Model<IBlogPost>) || mongoose.model<IBlogPost>("BlogPost", BlogPostSchema);
