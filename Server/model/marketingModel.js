import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discountType: { type: String, enum: ["percentage", "fixed"], default: "fixed" },
  value: { type: Number, required: true }, // e.g., 10 (percent) or 100 (rupees)
  expiryDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true }
});

const bannerSchema = new mongoose.Schema({
  title: { type: String },
  imageUrl: { type: String, required: true },
  link: { type: String }, // Where it redirects
  isActive: { type: Boolean, default: true }
});

export const Coupon = mongoose.model("Coupon", couponSchema);
export const Banner = mongoose.model("Banner", bannerSchema);