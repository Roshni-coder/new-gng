import {
    Notification,
    OrderAlert,
    SystemUpdate,
    VendorRequest,
    CustomerComplaint,
    NotificationSettings,
    ActivityLog
} from "../model/notificationModel.js";

// ============ GET ALL NOTIFICATIONS DATA ============
export const getAllNotificationsData = async (req, res) => {
    try {
        const [
            notifications,
            orderAlerts,
            systemUpdates,
            vendorRequests,
            customerComplaints,
            settings,
            activityLogs
        ] = await Promise.all([
            Notification.find().sort({ createdAt: -1 }).limit(100),
            OrderAlert.find().sort({ createdAt: -1 }).limit(50),
            SystemUpdate.find().sort({ createdAt: -1 }).limit(20),
            VendorRequest.find().sort({ createdAt: -1 }).limit(50),
            CustomerComplaint.find().sort({ createdAt: -1 }).limit(50),
            NotificationSettings.findOne({ userId: 'admin' }),
            ActivityLog.find().sort({ createdAt: -1 }).limit(100)
        ]);

        // Calculate stats
        const stats = {
            unreadNotifications: await Notification.countDocuments({ isRead: false }),
            unreadOrderAlerts: await OrderAlert.countDocuments({ isRead: false }),
            pendingVendorRequests: await VendorRequest.countDocuments({ status: 'pending' }),
            newComplaints: await CustomerComplaint.countDocuments({ status: 'new' }),
            totalActivityToday: await ActivityLog.countDocuments({
                createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
            })
        };

        res.status(200).json({
            success: true,
            notifications,
            orderAlerts,
            systemUpdates,
            vendorRequests,
            customerComplaints,
            settings: settings || {},
            activityLogs,
            stats
        });
    } catch (error) {
        console.error("Get All Notifications Data Error:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// ============ NOTIFICATIONS ============
export const getNotifications = async (req, res) => {
    try {
        const { type, isRead } = req.query;
        let query = {};
        if (type && type !== 'all') query.type = type;
        if (isRead !== undefined) query.isRead = isRead === 'true';

        const notifications = await Notification.find(query).sort({ createdAt: -1 });
        res.status(200).json({ success: true, notifications });
    } catch (error) {
        console.error("Get Notifications Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findByIdAndUpdate(
            id,
            { isRead: true, readAt: new Date() },
            { new: true }
        );
        res.status(200).json({ success: true, notification });
    } catch (error) {
        console.error("Mark As Read Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const markAllAsRead = async (req, res) => {
    try {
        const { type } = req.body;
        let query = { isRead: false };
        if (type && type !== 'all') query.type = type;

        await Notification.updateMany(query, { isRead: true, readAt: new Date() });
        res.status(200).json({ success: true, message: "All notifications marked as read" });
    } catch (error) {
        console.error("Mark All As Read Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        await Notification.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Notification deleted" });
    } catch (error) {
        console.error("Delete Notification Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const clearAllNotifications = async (req, res) => {
    try {
        const { type, olderThan } = req.body;
        let query = {};
        if (type && type !== 'all') query.type = type;
        if (olderThan) query.createdAt = { $lt: new Date(olderThan) };

        await Notification.deleteMany(query);
        res.status(200).json({ success: true, message: "Notifications cleared" });
    } catch (error) {
        console.error("Clear All Notifications Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ============ ORDER ALERTS ============
export const getOrderAlerts = async (req, res) => {
    try {
        const { alertType, isRead } = req.query;
        let query = {};
        if (alertType && alertType !== 'all') query.alertType = alertType;
        if (isRead !== undefined) query.isRead = isRead === 'true';

        const alerts = await OrderAlert.find(query).sort({ createdAt: -1 });
        res.status(200).json({ success: true, alerts });
    } catch (error) {
        console.error("Get Order Alerts Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const createOrderAlert = async (req, res) => {
    try {
        const alert = new OrderAlert(req.body);
        await alert.save();
        res.status(201).json({ success: true, message: "Order alert created", alert });
    } catch (error) {
        console.error("Create Order Alert Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const markOrderAlertRead = async (req, res) => {
    try {
        const { id } = req.params;
        const alert = await OrderAlert.findByIdAndUpdate(id, { isRead: true }, { new: true });
        res.status(200).json({ success: true, alert });
    } catch (error) {
        console.error("Mark Order Alert Read Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const deleteOrderAlert = async (req, res) => {
    try {
        const { id } = req.params;
        await OrderAlert.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Order alert deleted" });
    } catch (error) {
        console.error("Delete Order Alert Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ============ SYSTEM UPDATES ============
export const getSystemUpdates = async (req, res) => {
    try {
        const { status, updateType } = req.query;
        let query = {};
        if (status && status !== 'all') query.status = status;
        if (updateType && updateType !== 'all') query.updateType = updateType;

        const updates = await SystemUpdate.find(query).sort({ createdAt: -1 });
        res.status(200).json({ success: true, updates });
    } catch (error) {
        console.error("Get System Updates Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const createSystemUpdate = async (req, res) => {
    try {
        const { title, description, updateType, version, scheduledAt, affectedServices } = req.body;

        if (!title || !description) {
            return res.status(400).json({ success: false, message: "Title and description are required" });
        }

        const update = new SystemUpdate({
            title,
            description,
            updateType: updateType || 'announcement',
            version,
            scheduledAt,
            affectedServices
        });

        await update.save();
        res.status(201).json({ success: true, message: "System update created", update });
    } catch (error) {
        console.error("Create System Update Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const updateSystemUpdate = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (updateData.status === 'completed') {
            updateData.completedAt = new Date();
        }

        const update = await SystemUpdate.findByIdAndUpdate(id, updateData, { new: true });
        res.status(200).json({ success: true, update });
    } catch (error) {
        console.error("Update System Update Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const deleteSystemUpdate = async (req, res) => {
    try {
        const { id } = req.params;
        await SystemUpdate.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "System update deleted" });
    } catch (error) {
        console.error("Delete System Update Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ============ VENDOR REQUESTS ============
export const getVendorRequests = async (req, res) => {
    try {
        const { status, requestType } = req.query;
        let query = {};
        if (status && status !== 'all') query.status = status;
        if (requestType && requestType !== 'all') query.requestType = requestType;

        const requests = await VendorRequest.find(query).sort({ createdAt: -1 });
        res.status(200).json({ success: true, requests });
    } catch (error) {
        console.error("Get Vendor Requests Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const createVendorRequest = async (req, res) => {
    try {
        const request = new VendorRequest(req.body);
        await request.save();
        res.status(201).json({ success: true, message: "Vendor request created", request });
    } catch (error) {
        console.error("Create Vendor Request Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const updateVendorRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (['approved', 'rejected', 'resolved'].includes(updateData.status)) {
            updateData.resolvedAt = new Date();
        }

        const request = await VendorRequest.findByIdAndUpdate(id, updateData, { new: true });
        res.status(200).json({ success: true, request });
    } catch (error) {
        console.error("Update Vendor Request Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const deleteVendorRequest = async (req, res) => {
    try {
        const { id } = req.params;
        await VendorRequest.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Vendor request deleted" });
    } catch (error) {
        console.error("Delete Vendor Request Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ============ CUSTOMER COMPLAINTS ============
export const getCustomerComplaints = async (req, res) => {
    try {
        const { status, complaintType, priority } = req.query;
        let query = {};
        if (status && status !== 'all') query.status = status;
        if (complaintType && complaintType !== 'all') query.complaintType = complaintType;
        if (priority && priority !== 'all') query.priority = priority;

        const complaints = await CustomerComplaint.find(query).sort({ createdAt: -1 });
        res.status(200).json({ success: true, complaints });
    } catch (error) {
        console.error("Get Customer Complaints Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const createCustomerComplaint = async (req, res) => {
    try {
        const complaint = new CustomerComplaint(req.body);
        await complaint.save();
        res.status(201).json({ success: true, message: "Complaint registered", complaint });
    } catch (error) {
        console.error("Create Customer Complaint Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const updateCustomerComplaint = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (['resolved', 'closed'].includes(updateData.status)) {
            updateData.resolvedAt = new Date();
        }

        const complaint = await CustomerComplaint.findByIdAndUpdate(id, updateData, { new: true });
        res.status(200).json({ success: true, complaint });
    } catch (error) {
        console.error("Update Customer Complaint Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const deleteCustomerComplaint = async (req, res) => {
    try {
        const { id } = req.params;
        await CustomerComplaint.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Complaint deleted" });
    } catch (error) {
        console.error("Delete Customer Complaint Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ============ NOTIFICATION SETTINGS ============
export const getNotificationSettings = async (req, res) => {
    try {
        let settings = await NotificationSettings.findOne({ userId: 'admin' });

        // Create default settings if none exist
        if (!settings) {
            settings = new NotificationSettings({ userId: 'admin' });
            await settings.save();
        }

        res.status(200).json({ success: true, settings });
    } catch (error) {
        console.error("Get Notification Settings Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const updateNotificationSettings = async (req, res) => {
    try {
        const updateData = req.body;

        const settings = await NotificationSettings.findOneAndUpdate(
            { userId: 'admin' },
            updateData,
            { new: true, upsert: true }
        );

        res.status(200).json({ success: true, message: "Settings updated", settings });
    } catch (error) {
        console.error("Update Notification Settings Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ============ ACTIVITY LOGS ============
export const getActivityLogs = async (req, res) => {
    try {
        const { action, entityType, userRole, startDate, endDate, limit = 100 } = req.query;
        let query = {};

        if (action && action !== 'all') query.action = action;
        if (entityType && entityType !== 'all') query.entityType = entityType;
        if (userRole && userRole !== 'all') query.userRole = userRole;
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const logs = await ActivityLog.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.status(200).json({ success: true, logs });
    } catch (error) {
        console.error("Get Activity Logs Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const createActivityLog = async (req, res) => {
    try {
        const log = new ActivityLog(req.body);
        await log.save();
        res.status(201).json({ success: true, log });
    } catch (error) {
        console.error("Create Activity Log Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const clearActivityLogs = async (req, res) => {
    try {
        const { olderThan } = req.body;

        let query = {};
        if (olderThan) {
            query.createdAt = { $lt: new Date(olderThan) };
        }

        await ActivityLog.deleteMany(query);
        res.status(200).json({ success: true, message: "Activity logs cleared" });
    } catch (error) {
        console.error("Clear Activity Logs Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const getActivityStats = async (req, res) => {
    try {
        const today = new Date(new Date().setHours(0, 0, 0, 0));
        const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        const [todayCount, weekCount, monthCount, byAction, byEntity] = await Promise.all([
            ActivityLog.countDocuments({ createdAt: { $gte: today } }),
            ActivityLog.countDocuments({ createdAt: { $gte: thisWeek } }),
            ActivityLog.countDocuments({ createdAt: { $gte: thisMonth } }),
            ActivityLog.aggregate([
                { $match: { createdAt: { $gte: thisWeek } } },
                { $group: { _id: '$action', count: { $sum: 1 } } }
            ]),
            ActivityLog.aggregate([
                { $match: { createdAt: { $gte: thisWeek } } },
                { $group: { _id: '$entityType', count: { $sum: 1 } } }
            ])
        ]);

        res.status(200).json({
            success: true,
            stats: {
                today: todayCount,
                thisWeek: weekCount,
                thisMonth: monthCount,
                byAction: byAction.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
                byEntity: byEntity.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {})
            }
        });
    } catch (error) {
        console.error("Get Activity Stats Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
