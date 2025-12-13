import express from 'express';
import { 
    registerAdmin, 
    loginAdmin, 
    getAllOrders, 
    getAllSellers, 
    toggleApprove, 
    getAllProducts, 
    approveProduct, 
    getProductsBySeller, 
    getDashboardStats,    // Name matched to controller
    getRecentActivities,
    userlist,              // Added this since it was in your controller
    getAdminProducts,
    toggleFeatured,
    toggleUserBlock,
    deleteReview,
    getAllReviews,
    toggleSellerApproval,
    updateSellerCommission,
    getSellerProducts,
    getAllTransactions,
    getVendorPayouts,
    processPayout,
    getPendingSettlements,
    getCommissionReport,
    getRefunds,
    getFinancialStats,
    getAdvancedAnalytics,
    createCoupon,
    getMarketingData,
    updateStock,
    getInventoryData,
    exportSalesReport
} from '../controller/admincontroller.js';

const router = express.Router();

// --- Authentication ---
router.post('/register', registerAdmin);
router.post('/login', loginAdmin);

// --- Dashboard Data ---
router.get("/stats", getDashboardStats);
router.get('/activity', getRecentActivities);

// --- Management Routes ---
router.get('/orders', getAllOrders);
router.get('/sellers', getAllSellers);
router.get('/users', userlist); // Added route for userlist
router.put('/toggle-user-block/:userId', toggleUserBlock);
router.put('/toggle-approve/:sellerId', toggleApprove);

// --- Product Routes ---
// router.get('/products', getAllProducts);
router.put('/toggle-product/:productId', approveProduct);
router.get("/seller-products/:sellerId", getProductsBySeller);
// Add these routes
router.get('/products', getAdminProducts); // Accepts ?type=pending, etc.
router.put('/toggle-featured/:id', toggleFeatured);
router.get('/reviews',  getAllReviews);
router.delete('/delete-review/:id', deleteReview);
router.get('/sellers', getAllSellers);
router.put('/toggle-approve/:id', toggleSellerApproval);
router.put('/update-commission/:id', updateSellerCommission); // NEW
router.get('/seller-products/:id', getSellerProducts);
router.get('/finance/transactions', getAllTransactions);
router.get('/finance/payouts', getVendorPayouts);
router.post('/finance/payout-action', processPayout);
router.get('/finance/settlements', getPendingSettlements);
router.get('/finance/commissions', getCommissionReport);
router.get('/finance/refunds', getRefunds);
router.get('/finance/stats', getFinancialStats);
router.get("/inventory",  getInventoryData);
router.post("/inventory/update",  updateStock);

// Marketing
router.get("/marketing",  getMarketingData);
router.post("/marketing/coupon",  createCoupon);
router.get('/analytics/export',  exportSalesReport);
// Analytics
router.get("/analytics/advanced",  getAdvancedAnalytics);
export default router;