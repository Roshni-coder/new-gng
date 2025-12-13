import mongoose from "mongoose";

// Revenue Analytics Schema
const revenueAnalyticsSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    totalRevenue: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 },
    refunds: { type: Number, default: 0 },
    netRevenue: { type: Number, default: 0 },
    paymentMethods: {
        razorpay: Number,
        stripe: Number,
        cod: Number,
        paypal: Number
    },
    topCategories: [{
        category: String,
        revenue: Number,
        orders: Number
    }]
}, { timestamps: true });

// Vendor Performance Schema
const vendorPerformanceSchema = new mongoose.Schema({
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'seller', required: true },
    period: { type: String }, // 'daily', 'weekly', 'monthly'
    date: { type: Date, required: true },
    totalSales: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    totalProducts: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    fulfillmentRate: { type: Number, default: 100 },
    returnRate: { type: Number, default: 0 },
    responseTime: { type: Number, default: 0 }, // hours
    revenue: { type: Number, default: 0 }
}, { timestamps: true });

// Product Analytics Schema
const productAnalyticsSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'product' },
    date: { type: Date, required: true },
    views: { type: Number, default: 0 },
    addToCart: { type: Number, default: 0 },
    purchases: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    searchAppearances: { type: Number, default: 0 },
    wishlistAdds: { type: Number, default: 0 }
}, { timestamps: true });

// Customer Insights Schema
const customerInsightsSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    newCustomers: { type: Number, default: 0 },
    returningCustomers: { type: Number, default: 0 },
    totalCustomers: { type: Number, default: 0 },
    averageLifetimeValue: { type: Number, default: 0 },
    churnRate: { type: Number, default: 0 },
    demographics: {
        ageGroups: [{
            range: String,
            count: Number
        }],
        locations: [{
            city: String,
            count: Number
        }]
    },
    purchaseFrequency: {
        oneTime: Number,
        repeat: Number,
        frequent: Number
    }
}, { timestamps: true });

// Traffic Reports Schema
const trafficReportsSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    pageViews: { type: Number, default: 0 },
    uniqueVisitors: { type: Number, default: 0 },
    bounceRate: { type: Number, default: 0 },
    averageSessionDuration: { type: Number, default: 0 }, // seconds
    sources: {
        direct: Number,
        organic: Number,
        social: Number,
        referral: Number,
        paid: Number
    },
    devices: {
        desktop: Number,
        mobile: Number,
        tablet: Number
    },
    topPages: [{
        path: String,
        views: Number
    }]
}, { timestamps: true });

// Custom Reports Schema
const customReportSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    reportType: { type: String, enum: ['sales', 'inventory', 'customers', 'vendors', 'products', 'custom'] },
    filters: {
        dateRange: {
            start: Date,
            end: Date
        },
        categories: [String],
        vendors: [{ type: mongoose.Schema.Types.ObjectId }],
        status: [String]
    },
    columns: [{ type: String }],
    schedule: {
        enabled: { type: Boolean, default: false },
        frequency: { type: String, enum: ['daily', 'weekly', 'monthly'] },
        recipients: [{ type: String }]
    },
    lastRun: { type: Date },
    isPublic: { type: Boolean, default: false }
}, { timestamps: true });

// Export Data Logs Schema
const exportLogsSchema = new mongoose.Schema({
    exportType: { type: String, required: true }, // 'orders', 'products', 'customers', 'vendors'
    format: { type: String, enum: ['csv', 'xlsx', 'pdf', 'json'], default: 'csv' },
    filters: { type: mongoose.Schema.Types.Mixed },
    recordCount: { type: Number, default: 0 },
    fileSize: { type: Number }, // bytes
    filePath: { type: String },
    status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
    exportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    errorMessage: { type: String },
    downloadCount: { type: Number, default: 0 }
}, { timestamps: true });

// Add indexes
revenueAnalyticsSchema.index({ date: -1 });
vendorPerformanceSchema.index({ vendorId: 1, date: -1 });
productAnalyticsSchema.index({ productId: 1, date: -1 });
trafficReportsSchema.index({ date: -1 });

export const RevenueAnalytics = mongoose.model('RevenueAnalytics', revenueAnalyticsSchema);
export const VendorPerformance = mongoose.model('VendorPerformance', vendorPerformanceSchema);
export const ProductAnalytics = mongoose.model('ProductAnalytics', productAnalyticsSchema);
export const CustomerInsights = mongoose.model('CustomerInsights', customerInsightsSchema);
export const TrafficReports = mongoose.model('TrafficReports', trafficReportsSchema);
export const CustomReport = mongoose.model('CustomReport', customReportSchema);
export const ExportLogs = mongoose.model('ExportLogs', exportLogsSchema);
