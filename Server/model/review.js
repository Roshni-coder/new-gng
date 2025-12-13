import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true
  },
  comment: {
    type: String
  },
  title: {
    type: String
  },
  sellerResponse: {
    type: String,
    default: null
  },
  respondedAt: {
    type: Date,
    default: null
  },
  isHidden: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Reported'],
    default: 'Pending'
  },
  reportReason: { type: String },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 }

}, { timestamps: true });

const Review = mongoose.model("Review", reviewSchema);
export default Review;
