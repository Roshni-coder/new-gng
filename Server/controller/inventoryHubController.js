import Warehouse from '../model/Warehouse.js';
import Product from '../model/addproduct.js'; // CORRECTED IMPORT

// --- WAREHOUSE MANAGEMENT ---
export const addWarehouse = async (req, res) => {
    try {
        const warehouse = new Warehouse(req.body);
        await warehouse.save();
        res.status(201).json({ success: true, warehouse });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getWarehouses = async (req, res) => {
    try {
        const warehouses = await Warehouse.find();
        res.status(200).json({ success: true, warehouses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateWarehouse = async (req, res) => {
    try {
        const warehouse = await Warehouse.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ success: true, warehouse });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteWarehouse = async (req, res) => {
    try {
        await Warehouse.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Warehouse deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- BULK STOCK UPDATE ---
export const bulkStockUpdate = async (req, res) => {
    // Expects an array of updates: [{ productId, stock }]
    try {
        const { updates } = req.body;

        if (!updates || !Array.isArray(updates)) {
            return res.status(400).json({ success: false, message: 'Invalid data format' });
        }

        const bulkOps = updates.map(update => {
            const stockVal = parseInt(update.stock);
            let availability = "In Stock";
            let isAvailable = true;

            if (stockVal <= 0) {
                availability = "Out of Stock";
                isAvailable = false;
            } else if (stockVal < 5) {
                availability = "Low Stock";
            }

            return {
                updateOne: {
                    filter: { _id: update.productId },
                    update: {
                        $set: {
                            stock: stockVal, // Correct field name
                            availability: availability, // Manual hook logic
                            isAvailable: isAvailable
                        }
                    }
                }
            };
        });

        const result = await Product.bulkWrite(bulkOps);

        res.status(200).json({
            success: true,
            message: 'Bulk update successful',
            modifiedCount: result.modifiedCount
        });

    } catch (error) {
        console.error("Bulk Update Error:", error);
        res.status(500).json({ success: false, message: 'Server Error during bulk update' });
    }
};
