import mongoose from "mongoose";

// Vendor Message Schema
const vendorMessageSchema = new mongoose.Schema({
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller' },
    vendorName: { type: String, required: true },
    vendorEmail: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['unread', 'read', 'replied'], default: 'unread' },
    replies: [{
        message: String,
        isAdmin: { type: Boolean, default: true },
        date: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

// Support Ticket Schema
const supportTicketSchema = new mongoose.Schema({
    ticketId: { type: String, unique: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    customerName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    status: { type: String, enum: ['open', 'in-progress', 'resolved', 'closed'], default: 'open' },
    category: { type: String, default: 'general' },
    messages: [{
        sender: { type: String, enum: ['customer', 'admin'], required: true },
        message: { type: String, required: true },
        date: { type: Date, default: Date.now }
    }],
    assignedTo: { type: String },
    resolvedAt: { type: Date }
}, { timestamps: true });

// Auto-generate ticket ID
supportTicketSchema.pre('save', async function (next) {
    if (this.isNew) {
        const count = await mongoose.model('SupportTicket').countDocuments();
        this.ticketId = `TKT-${String(count + 1).padStart(5, '0')}`;
    }
    next();
});

// Announcement Schema
const announcementSchema = new mongoose.Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    priority: { type: String, enum: ['low', 'normal', 'high'], default: 'normal' },
    targetAudience: { type: String, enum: ['all', 'vendors', 'customers'], default: 'all' },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date }
}, { timestamps: true });

// Email Template Schema
const emailTemplateSchema = new mongoose.Schema({
    name: { type: String, required: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    type: { type: String, enum: ['general', 'onboarding', 'transactional', 'marketing', 'security'], default: 'general' },
    variables: [{ type: String }], // e.g., ['{{name}}', '{{orderId}}']
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// SMS Template Schema
const smsTemplateSchema = new mongoose.Schema({
    name: { type: String, required: true },
    message: { type: String, required: true, maxlength: 160 },
    type: { type: String, enum: ['general', 'transactional', 'security', 'promotional'], default: 'general' },
    variables: [{ type: String }],
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Help Documentation Schema
const helpDocSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, enum: ['general', 'onboarding', 'products', 'orders', 'payments', 'shipping'], default: 'general' },
    tags: [{ type: String }],
    views: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true }
}, { timestamps: true });

// Training Resource Schema
const trainingResourceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    type: { type: String, enum: ['video', 'pdf', 'webinar', 'article'], default: 'video' },
    url: { type: String, required: true },
    duration: { type: String }, // e.g., "45 min"
    pages: { type: Number }, // for PDFs
    thumbnail: { type: String },
    views: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// System Status Schema
const systemStatusSchema = new mongoose.Schema({
    service: { type: String, required: true, unique: true },
    status: { type: String, enum: ['operational', 'degraded', 'outage', 'maintenance'], default: 'operational' },
    lastChecked: { type: Date, default: Date.now },
    message: { type: String }
}, { timestamps: true });

// Chat Session Schema (for future live chat implementation)
const chatSessionSchema = new mongoose.Schema({
    sessionId: { type: String, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String },
    userEmail: { type: String },
    userType: { type: String, enum: ['customer', 'vendor'], default: 'customer' },
    status: { type: String, enum: ['waiting', 'active', 'closed'], default: 'waiting' },
    assignedAgent: { type: String },
    messages: [{
        sender: { type: String, enum: ['user', 'agent', 'system'] },
        message: { type: String },
        timestamp: { type: Date, default: Date.now }
    }],
    rating: { type: Number, min: 1, max: 5 },
    feedback: { type: String }
}, { timestamps: true });

// Export all models
export const VendorMessage = mongoose.model('VendorMessage', vendorMessageSchema);
export const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);
export const Announcement = mongoose.model('Announcement', announcementSchema);
export const EmailTemplate = mongoose.model('EmailTemplate', emailTemplateSchema);
export const SmsTemplate = mongoose.model('SmsTemplate', smsTemplateSchema);
export const HelpDoc = mongoose.model('HelpDoc', helpDocSchema);
export const TrainingResource = mongoose.model('TrainingResource', trainingResourceSchema);
export const SystemStatus = mongoose.model('SystemStatus', systemStatusSchema);
export const ChatSession = mongoose.model('ChatSession', chatSessionSchema);
