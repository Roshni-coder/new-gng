import mongoose from "mongoose";

const shippingSettingsSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Seller",
    required: true,
    unique: true
  },
  defaultShippingRate: {
    type: Number,
    default: 0
  },
  freeShippingThreshold: {
    type: Number,
    default: 500
  },
  processingTime: {
    type: Number, // in days
    default: 2
  },
  deliveryPartners: [{
    name: String,
    isActive: Boolean,
    priority: Number
  }],
  shippingZones: [{
    zoneName: String,
    states: [String],
    rate: Number,
    deliveryDays: Number
  }],
  packageDimensions: {
    defaultWeight: Number,
    defaultLength: Number,
    defaultWidth: Number,
    defaultHeight: Number
  },
  pickupAddress: {
    name: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    pincode: String
  },
  returnAddress: {
    name: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
    sameAsPickup: { type: Boolean, default: true }
  },
  pickupSchedule: [{
    day: String,
    timeSlot: String,
    isActive: Boolean
  }],
  codSettings: {
    enabled: { type: Boolean, default: true },
    minOrderValue: { type: Number, default: 0 },
    maxOrderValue: { type: Number, default: 10000 },
    extraCharge: { type: Number, default: 0 }
  },
  trackingSettings: {
    enabled: { type: Boolean, default: true },
    provider: { type: String, default: 'Shiprocket' },
    autoNotify: { type: Boolean, default: true }
  },
  bulkShipping: {
    autoGenerateLabels: { type: Boolean, default: false }
  }

}, { timestamps: true });

const ShippingSettingsModel = mongoose.models.ShippingSettings || mongoose.model("ShippingSettings", shippingSettingsSchema);
export default ShippingSettingsModel;
