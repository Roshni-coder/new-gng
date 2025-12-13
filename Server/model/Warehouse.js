import mongoose from 'mongoose';

const warehouseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    manager: { type: String },
    contactNumber: { type: String },
    capacity: { type: Number }, // e.g., max items
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Warehouse', warehouseSchema);

