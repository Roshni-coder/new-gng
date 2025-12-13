import express from 'express';
import {
    addWarehouse,
    getWarehouses,
    updateWarehouse,
    deleteWarehouse,
    bulkStockUpdate
} from '../controller/inventoryHubController.js';
import adminAuth from '../middleware/authAdmin.js';

const router = express.Router();

// Warehouse Routes
router.post('/warehouse/add', adminAuth, addWarehouse);
router.get('/warehouse/all', adminAuth, getWarehouses);
router.put('/warehouse/update/:id', adminAuth, updateWarehouse);
router.delete('/warehouse/delete/:id', adminAuth, deleteWarehouse);

// Bulk Update
router.post('/bulk-update', adminAuth, bulkStockUpdate);

export default router;
