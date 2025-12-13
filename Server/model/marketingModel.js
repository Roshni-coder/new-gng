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

const campaignSchema = new mongoose.Schema({
  title: String,
  type: { type: String, enum: ['Email', 'SMS', 'Push', 'Flash Sale', 'Affiliate', 'General'] },
  status: { type: String, enum: ['Scheduled', 'Active', 'Completed', 'Draft'], default: 'Draft' },
  startDate: Date,
  endDate: Date,
  targetAudience: { type: String, default: 'All' },
  metrics: {
    clicks: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 }
  },
  content: String // HTML for email, Text for SMS etc
}, { timestamps: true });

export const Campaign = mongoose.model("Campaign", campaignSchema);

const flashSaleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  discountPercentage: { type: Number, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  isActive: { type: Boolean, default: true }
});

export const FlashSale = mongoose.model("FlashSale", flashSaleSchema);

const affiliateSchema = new mongoose.Schema({
  isActive: { type: Boolean, default: false },
  commissionRate: { type: Number, default: 5 }, // Default 5%
  terms: { type: String, default: "" },
  referralCodePrefix: { type: String, default: "REF" }
});

export const AffiliateSettings = mongoose.model("AffiliateSettings", affiliateSchema);

