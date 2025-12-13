import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    categoryname: {
        type: String,
        required: true,
        unique: true
    },
    images: [{
        url: { type: String, required: true },
        altText: { type: String, default: '' }
    }],
    commissionRate: { type: Number, default: 0 },
    attributes: [{ name: String, options: [String] }] // Enhanced attributes structure

});

const Category = mongoose.model("Category", categorySchema);
export default Category;
