import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true 
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    activityLog: [
    {
      action: { type: String }, // e.g., "Login", "Purchase"
      date: { type: Date, default: Date.now }
    }
  ],
    verifyotp: {
        type: String,
        default: ''
    },
    verifyotpexpAt: {
        type: Number,
        default: 0
    },
    isAccountVerify: {
        type: Boolean,
        default: false
    },
    resetotp: {
        type: String,
        default: ''
    },
    resetotpexpireAt: { 
        type: Number,
        default: 0
    },
    isBlocked: { type: Boolean, default: false },
    
});

// Corrected model creation logic
const usermodel = mongoose.models.user || mongoose.model('user', userSchema);

export default usermodel;
