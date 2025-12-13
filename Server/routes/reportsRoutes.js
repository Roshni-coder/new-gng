import express from 'express';
import {
    getRevenueAnalytics,
    getVendorPerformance,
    getProductAnalytics,
    getCustomerInsights,
    getTrafficReports,
    getCustomReports,
    createCustomReport,
    updateCustomReport,
    deleteCustomReport,
    runCustomReport,
    getExportLogs,
    createExport,
    deleteExportLog,
    getReportsSummary
} from '../controller/reportsController.js';

const router = express.Router();

// Summary
router.get('/summary', getReportsSummary);

// Revenue Analytics
router.get('/revenue', getRevenueAnalytics);

// Vendor Performance
router.get('/vendor-performance', getVendorPerformance);

// Product Analytics
router.get('/product-analytics', getProductAnalytics);

// Customer Insights
router.get('/customer-insights', getCustomerInsights);

// Traffic Reports
router.get('/traffic', getTrafficReports);

// Custom Reports
router.get('/custom', getCustomReports);
router.post('/custom', createCustomReport);
router.put('/custom/:id', updateCustomReport);
router.delete('/custom/:id', deleteCustomReport);
router.post('/custom/:id/run', runCustomReport);

// Export Data
router.get('/exports', getExportLogs);
router.post('/export', createExport);
router.delete('/export/:id', deleteExportLog);

export default router;
