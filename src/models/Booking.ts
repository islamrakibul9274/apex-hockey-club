import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBooking extends Document {
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  bookingType: "ticket" | "program" | "membership";
  itemId: string;
  itemTitle: string;
  tierOrPlan?: string;
  seatsCount: number;
  totalAmount: number;
  date?: string;
  time?: string;
  status: "confirmed" | "pending" | "cancelled";
  paymentStatus: "paid" | "pending" | "failed";
  stripeSessionId?: string;
  createdAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    userId: { type: String, default: null },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, default: "" },
    bookingType: { type: String, enum: ["ticket", "program", "membership"], required: true },
    itemId: { type: String, required: true },
    itemTitle: { type: String, required: true },
    tierOrPlan: { type: String, default: "Standard" },
    seatsCount: { type: Number, default: 1 },
    totalAmount: { type: Number, required: true },
    date: { type: String },
    time: { type: String },
    status: { type: String, enum: ["confirmed", "pending", "cancelled"], default: "confirmed" },
    paymentStatus: { type: String, enum: ["paid", "pending", "failed"], default: "paid" },
    stripeSessionId: { type: String },
  },
  { timestamps: true }
);

export default (mongoose.models.Booking as Model<IBooking>) || mongoose.model<IBooking>("Booking", BookingSchema);
