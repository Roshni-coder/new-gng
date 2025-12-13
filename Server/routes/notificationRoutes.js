import express from 'express';
import {
    getAllNotificationsData,
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    getOrderAlerts,
    createOrderAlert,
    markOrderAlertRead,
    deleteOrderAlert,
    getSystemUpdates,
    createSystemUpdate,
    updateSystemUpdate,
    deleteSystemUpdate,
    getVendorRequests,
    createVendorRequest,
    updateVendorRequest,
    deleteVendorRequest,
    getCustomerComplaints,
    createCustomerComplaint,
    updateCustomerComplaint,
    deleteCustomerComplaint,
    getNotificationSettings,
    updateNotificationSettings,
    getActivityLogs,
    createActivityLog,
    clearActivityLogs,
    getActivityStats
} from '../controller/notificationController.js';

const router = express.Router();

// Main data endpoint - gets all notifications data in one call
router.get('/', getAllNotificationsData);

// Notifications
router.get('/notifications', getNotifications);
router.put('/notification/:id/read', markAsRead);
router.post('/notifications/mark-all-read', markAllAsRead);
router.delete('/notification/:id', deleteNotification);
router.post('/notifications/clear', clearAllNotifications);

// Order Alerts
router.get('/order-alerts', getOrderAlerts);
router.post('/order-alert', createOrderAlert);
router.put('/order-alert/:id/read', markOrderAlertRead);
router.delete('/order-alert/:id', deleteOrderAlert);

// System Updates
router.get('/system-updates', getSystemUpdates);
router.post('/system-update', createSystemUpdate);
router.put('/system-update/:id', updateSystemUpdate);
router.delete('/system-update/:id', deleteSystemUpdate);

// Vendor Requests
router.get('/vendor-requests', getVendorRequests);
router.post('/vendor-request', createVendorRequest);
router.put('/vendor-request/:id', updateVendorRequest);
router.delete('/vendor-request/:id', deleteVendorRequest);

// Customer Complaints
router.get('/complaints', getCustomerComplaints);
router.post('/complaint', createCustomerComplaint);
router.put('/complaint/:id', updateCustomerComplaint);
router.delete('/complaint/:id', deleteCustomerComplaint);

// Notification Settings
router.get('/settings', getNotificationSettings);
router.put('/settings', updateNotificationSettings);

// Activity Logs
router.get('/activity-logs', getActivityLogs);
router.post('/activity-log', createActivityLog);
router.post('/activity-logs/clear', clearActivityLogs);
router.get('/activity-stats', getActivityStats);

export default router;
