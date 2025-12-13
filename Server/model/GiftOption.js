import mongoose from 'mongoose';

const giftOptionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['wrapper', 'card', 'message', 'packaging', 'corporate', 'bulk'],

        required: true
    },
    price: {
        type: Number,
        required: true,
        default: 0
    },
    images: [{
        url: String,
        public_id: String
    }],
    description: String,
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export default mongoose.model('GiftOption', giftOptionSchema);

