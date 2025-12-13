import mongoose from "mongoose";

const userActivitySchema = new mongoose.Schema({
  user: { type: String, required: true }, // Name of the user/admin/seller
  role: { type: String, default: 'User' }, // e.g., 'Admin', 'Seller', 'Customer'
  action: { type: String, required: true }, // e.g., 'Logged In', 'Deleted Product'
  type: { 
    type: String, 
    enum: ['success', 'error', 'warning', 'info'], 
    default: 'info' 
  },
  ip: { type: String }
}, { timestamps: true });

const UserActivity = mongoose.model("UserActivity", userActivitySchema);
export default UserActivity;