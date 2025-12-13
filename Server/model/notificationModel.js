import mongoose from "mongoose";

// Notification Schema
const notificationSchema = new mongoose.Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
        type: String,
        enum: ['order', 'system', 'vendor', 'customer', 'general'],
        default: 'general'
    },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    actionUrl: { type: String }, // Link to related page
    actionLabel: { type: String }, // e.g., "View Order"
    metadata: { type: mongoose.Schema.Types.Mixed }, // Additional data like orderId, vendorId, etc.
    expiresAt: { type: Date }
}, { timestamps: true });

// Order Alert Schema
const orderAlertSchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    orderNumber: { type: String },
    alertType: {
        type: String,
        enum: ['new_order', 'payment_received', 'payment_failed', 'order_cancelled', 'refund_requested', 'delivery_delayed', 'order_returned'],
        required: true
    },
    customerName: { type: String },
    amount: { type: Number },
    message: { type: String },
    isRead: { type: Boolean, default: false },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' }
}, { timestamps: true });

// System Update Schema
const systemUpdateSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    updateType: {
        type: String,
        enum: ['maintenance', 'feature', 'security', 'performance', 'bug_fix', 'announcement'],
        default: 'announcement'
    },
    version: { type: String },
    scheduledAt: { type: Date },
    completedAt: { type: Date },
    status: { type: String, enum: ['scheduled', 'in_progress', 'completed', 'cancelled'], default: 'scheduled' },
    affectedServices: [{ type: String }],
    isRead: { type: Boolean, default: false }
}, { timestamps: true });

// Vendor Request Schema
const vendorRequestSchema = new mongoose.Schema({
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller' },
    vendorName: { type: String, required: true },
    vendorEmail: { type: String },
    requestType: {
        type: String,
        enum: ['registration', 'product_approval', 'payout', 'account_update', 'support', 'commission_dispute', 'other'],
        required: true
    },
    subject: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['pending', 'in_review', 'approved', 'rejected', 'resolved'], default: 'pending' },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    assignedTo: { type: String },
    resolvedAt: { type: Date },
    notes: { type: String }
}, { timestamps: true });

// Customer Complaint Schema
const customerComplaintSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    customerName: { type: String, required: true },
    customerEmail: { type: String },
    customerPhone: { type: String },
    complaintType: {
        type: String,
        enum: ['product_quality', 'delivery_issue', 'payment_issue', 'refund', 'vendor_issue', 'website_bug', 'other'],
        required: true
    },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    orderNumber: { type: String },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['new', 'investigating', 'resolved', 'closed', 'escalated'], default: 'new' },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    assignedTo: { type: String },
    resolution: { type: String },
    resolvedAt: { type: Date },
    satisfactionRating: { type: Number, min: 1, max: 5 }
}, { timestamps: true });

// Notification Settings Schema
const notificationSettingsSchema = new mongoose.Schema({
    userId: { type: String, default: 'admin' },
    emailNotifications: {
        orderAlerts: { type: Boolean, default: true },
        vendorRequests: { type: Boolean, default: true },
        customerComplaints: { type: Boolean, default: true },
        systemUpdates: { type: Boolean, default: true },
        lowStock: { type: Boolean, default: true },
        dailyReport: { type: Boolean, default: false }
    },
    pushNotifications: {
        orderAlerts: { type: Boolean, default: true },
        vendorRequests: { type: Boolean, default: true },
        customerComplaints: { type: Boolean, default: true },
        systemUpdates: { type: Boolean, default: false }
    },
    smsNotifications: {
        urgentOrders: { type: Boolean, default: false },
        criticalAlerts: { type: Boolean, default: false }
    },
    quietHours: {
        enabled: { type: Boolean, default: false },
        start: { type: String, default: "22:00" },
        end: { type: String, default: "08:00" }
    }
}, { timestamps: true });

// Activity Log Schema
const activityLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId },
    userName: { type: String },
    userRole: { type: String, enum: ['admin', 'seller', 'customer', 'system'], default: 'admin' },
    action: { type: String, required: true }, // e.g., 'created', 'updated', 'deleted', 'viewed', 'login', 'logout'
    entityType: { type: String }, // e.g., 'product', 'order', 'user', 'category'
    entityId: { type: mongoose.Schema.Types.ObjectId },
    entityName: { type: String },
    description: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed }, // Additional context
    ipAddress: { type: String },
    userAgent: { type: String },
    status: { type: String, enum: ['success', 'failed', 'pending'], default: 'success' }
}, { timestamps: true });

// Create indexes for better query performance
activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, entityType: 1 });
activityLogSchema.index({ createdAt: -1 });

notificationSchema.index({ type: 1, isRead: 1, createdAt: -1 });
orderAlertSchema.index({ isRead: 1, createdAt: -1 });

// Export all models
export const Notification = mongoose.model('Notification', notificationSchema);
export const OrderAlert = mongoose.model('OrderAlert', orderAlertSchema);
export const SystemUpdate = mongoose.model('SystemUpdate', systemUpdateSchema);
export const VendorRequest = mongoose.model('VendorRequest', vendorRequestSchema);
export const CustomerComplaint = mongoose.model('CustomerComplaint', customerComplaintSchema);
export const NotificationSettings = mongoose.model('NotificationSettings', notificationSettingsSchema);
export const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
