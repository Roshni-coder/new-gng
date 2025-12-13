import mongoose from "mongoose";

// Site Configuration Schema
const siteConfigSchema = new mongoose.Schema({
    siteName: { type: String, default: "Gift N Gifts" },
    siteUrl: { type: String },
    logo: { type: String },
    favicon: { type: String },
    tagline: { type: String },
    description: { type: String },
    contactEmail: { type: String },
    contactPhone: { type: String },
    address: { type: String },
    socialLinks: {
        facebook: String,
        instagram: String,
        twitter: String,
        youtube: String,
        linkedin: String
    },
    currency: { type: String, default: "INR" },
    currencySymbol: { type: String, default: "₹" },
    timezone: { type: String, default: "Asia/Kolkata" },
    language: { type: String, default: "en" },
    maintenanceMode: { type: Boolean, default: false },
    maintenanceMessage: { type: String }
}, { timestamps: true });

// Payment Gateway Schema
const paymentGatewaySchema = new mongoose.Schema({
    gateway: { type: String, enum: ['razorpay', 'stripe', 'paypal', 'paytm', 'cod'], required: true },
    isActive: { type: Boolean, default: false },
    testMode: { type: Boolean, default: true },
    credentials: {
        keyId: String,
        keySecret: String,
        webhookSecret: String,
        merchantId: String
    },
    settings: {
        autoCapture: { type: Boolean, default: true },
        refundEnabled: { type: Boolean, default: true },
        partialPayment: { type: Boolean, default: false }
    },
    displayName: { type: String },
    description: { type: String },
    icon: { type: String },
    order: { type: Number, default: 0 }
}, { timestamps: true });

// Email Settings Schema
const emailSettingsSchema = new mongoose.Schema({
    provider: { type: String, enum: ['smtp', 'sendgrid', 'mailgun', 'ses'], default: 'smtp' },
    isActive: { type: Boolean, default: false },
    smtp: {
        host: String,
        port: { type: Number, default: 587 },
        secure: { type: Boolean, default: false },
        username: String,
        password: String
    },
    apiKey: { type: String },
    fromEmail: { type: String },
    fromName: { type: String },
    replyTo: { type: String },
    bccAdmin: { type: Boolean, default: false },
    bccEmail: { type: String },
    dailyLimit: { type: Number, default: 500 }
}, { timestamps: true });

// SMS Settings Schema
const smsSettingsSchema = new mongoose.Schema({
    provider: { type: String, enum: ['twilio', 'msg91', 'textlocal', 'aws_sns'], default: 'twilio' },
    isActive: { type: Boolean, default: false },
    credentials: {
        accountSid: String,
        authToken: String,
        senderId: String,
        apiKey: String
    },
    templates: {
        otp: String,
        orderConfirmation: String,
        orderShipped: String,
        orderDelivered: String
    },
    dailyLimit: { type: Number, default: 1000 }
}, { timestamps: true });

// Tax Configuration Schema
const taxConfigSchema = new mongoose.Schema({
    taxName: { type: String, default: "GST" },
    isEnabled: { type: Boolean, default: true },
    includedInPrice: { type: Boolean, default: true },
    displayOnCheckout: { type: Boolean, default: true },
    taxRates: [{
        name: String,
        rate: Number,
        category: String, // e.g., "electronics", "clothing", "food"
        isDefault: Boolean
    }],
    exemptCategories: [{ type: String }],
    taxNumber: { type: String }, // GST number
    taxFilingFrequency: { type: String, enum: ['monthly', 'quarterly', 'annually'] }
}, { timestamps: true });

// API Management Schema
const apiManagementSchema = new mongoose.Schema({
    apiName: { type: String, required: true },
    apiKey: { type: String },
    apiSecret: { type: String },
    isActive: { type: Boolean, default: false },
    rateLimit: { type: Number, default: 1000 },
    rateLimitWindow: { type: Number, default: 3600 }, // seconds
    allowedOrigins: [{ type: String }],
    permissions: [{ type: String }],
    expiresAt: { type: Date },
    lastUsed: { type: Date },
    usageCount: { type: Number, default: 0 }
}, { timestamps: true });

// User Permissions Schema
const userPermissionsSchema = new mongoose.Schema({
    roleName: { type: String, required: true, unique: true },
    description: { type: String },
    isSystemRole: { type: Boolean, default: false },
    permissions: {
        dashboard: { view: Boolean, edit: Boolean },
        products: { view: Boolean, create: Boolean, edit: Boolean, delete: Boolean },
        orders: { view: Boolean, edit: Boolean, cancel: Boolean, refund: Boolean },
        users: { view: Boolean, create: Boolean, edit: Boolean, delete: Boolean, block: Boolean },
        vendors: { view: Boolean, approve: Boolean, edit: Boolean, delete: Boolean },
        categories: { view: Boolean, create: Boolean, edit: Boolean, delete: Boolean },
        reports: { view: Boolean, export: Boolean },
        settings: { view: Boolean, edit: Boolean },
        marketing: { view: Boolean, create: Boolean, edit: Boolean },
        finance: { view: Boolean, edit: Boolean, process: Boolean }
    },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }]
}, { timestamps: true });

// Security Settings Schema
const securitySettingsSchema = new mongoose.Schema({
    twoFactorAuth: {
        enabled: { type: Boolean, default: false },
        requiredForAdmin: { type: Boolean, default: true },
        methods: [{ type: String, enum: ['email', 'sms', 'authenticator'] }]
    },
    passwordPolicy: {
        minLength: { type: Number, default: 8 },
        requireUppercase: { type: Boolean, default: true },
        requireLowercase: { type: Boolean, default: true },
        requireNumbers: { type: Boolean, default: true },
        requireSpecialChars: { type: Boolean, default: false },
        expiryDays: { type: Number, default: 90 },
        preventReuse: { type: Number, default: 5 }
    },
    loginSecurity: {
        maxAttempts: { type: Number, default: 5 },
        lockoutDuration: { type: Number, default: 30 }, // minutes
        sessionTimeout: { type: Number, default: 60 }, // minutes
        singleSession: { type: Boolean, default: false }
    },
    ipWhitelist: [{ type: String }],
    ipBlacklist: [{ type: String }],
    captchaEnabled: { type: Boolean, default: false },
    captchaProvider: { type: String, enum: ['recaptcha', 'hcaptcha'] },
    captchaSiteKey: { type: String },
    captchaSecretKey: { type: String }
}, { timestamps: true });

// GDPR Compliance Schema
const gdprComplianceSchema = new mongoose.Schema({
    cookieConsent: {
        enabled: { type: Boolean, default: true },
        message: String,
        acceptButtonText: String,
        declineButtonText: String,
        policyLink: String
    },
    dataRetention: {
        userDataDays: { type: Number, default: 365 },
        orderDataDays: { type: Number, default: 730 },
        logDataDays: { type: Number, default: 90 }
    },
    privacyPolicy: {
        content: String,
        lastUpdated: Date,
        version: String
    },
    termsOfService: {
        content: String,
        lastUpdated: Date,
        version: String
    },
    dataExportEnabled: { type: Boolean, default: true },
    dataDeletionEnabled: { type: Boolean, default: true },
    consentLogging: { type: Boolean, default: true }
}, { timestamps: true });

// Data Backup Schema
const dataBackupSchema = new mongoose.Schema({
    backupName: { type: String, required: true },
    backupType: { type: String, enum: ['full', 'incremental', 'database', 'files'], default: 'full' },
    status: { type: String, enum: ['pending', 'running', 'completed', 'failed'], default: 'pending' },
    size: { type: Number }, // bytes
    location: { type: String },
    collections: [{ type: String }],
    startedAt: { type: Date },
    completedAt: { type: Date },
    errorMessage: { type: String },
    autoBackup: { type: Boolean, default: false },
    retentionDays: { type: Number, default: 30 }
}, { timestamps: true });

// Backup Settings Schema
const backupSettingsSchema = new mongoose.Schema({
    autoBackupEnabled: { type: Boolean, default: false },
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'weekly' },
    time: { type: String, default: "02:00" },
    retentionCount: { type: Number, default: 10 },
    storageLocation: { type: String, enum: ['local', 's3', 'gcs', 'azure'], default: 'local' },
    cloudCredentials: {
        accessKey: String,
        secretKey: String,
        bucket: String,
        region: String
    },
    notifyOnComplete: { type: Boolean, default: true },
    notifyOnFail: { type: Boolean, default: true },
    notifyEmail: { type: String }
}, { timestamps: true });

// Personalization Tools Schema
const personalizationToolsSchema = new mongoose.Schema({
    enableRecommendations: { type: Boolean, default: true },
    recommendationAlgorithm: { type: String, enum: ['collaborative', 'content-based', 'hybrid'], default: 'hybrid' },
    maxRecommendations: { type: Number, default: 10 },
    enableRecentlyViewed: { type: Boolean, default: true },
    recentlyViewedLimit: { type: Number, default: 10 },
    enableWishlistReminders: { type: Boolean, default: true },
    enableAbandonedCartReminders: { type: Boolean, default: true },
    abandonedCartDelay: { type: Number, default: 24 }, // hours
    enablePersonalizedEmails: { type: Boolean, default: true },
    enableBirthdayOffers: { type: Boolean, default: true },
    birthdayDiscountPercent: { type: Number, default: 10 }
}, { timestamps: true });

// Message Templates Schema
const messageTemplateSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['email', 'sms', 'push', 'whatsapp'], required: true },
    trigger: { type: String }, // e.g., 'order_placed', 'order_shipped'
    subject: { type: String },
    body: { type: String, required: true },
    variables: [{ type: String }],
    isActive: { type: Boolean, default: true },
    category: { type: String }
}, { timestamps: true });

// Customization Settings Schema
const customizationSettingsSchema = new mongoose.Schema({
    theme: {
        primaryColor: { type: String, default: "#3B82F6" },
        secondaryColor: { type: String, default: "#10B981" },
        accentColor: { type: String, default: "#F59E0B" },
        backgroundColor: { type: String, default: "#FFFFFF" },
        textColor: { type: String, default: "#1F2937" },
        fontFamily: { type: String, default: "Inter" }
    },
    checkout: {
        guestCheckout: { type: Boolean, default: true },
        showOrderSummary: { type: Boolean, default: true },
        showCouponField: { type: Boolean, default: true },
        showGiftWrap: { type: Boolean, default: true },
        termsRequired: { type: Boolean, default: true }
    },
    productPage: {
        showStock: { type: Boolean, default: true },
        showSKU: { type: Boolean, default: false },
        showReviews: { type: Boolean, default: true },
        showRelated: { type: Boolean, default: true },
        showShare: { type: Boolean, default: true },
        enableZoom: { type: Boolean, default: true }
    },
    notifications: {
        showNewOrders: { type: Boolean, default: true },
        playSound: { type: Boolean, default: false },
        desktopNotifications: { type: Boolean, default: true }
    }
}, { timestamps: true });

// Greeting Cards Schema
const greetingCardSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { type: String, enum: ['birthday', 'anniversary', 'wedding', 'festive', 'thank_you', 'congratulations', 'sympathy', 'other'], required: true },
    image: { type: String },
    template: { type: String },
    isActive: { type: Boolean, default: true },
    isPremium: { type: Boolean, default: false },
    price: { type: Number, default: 0 },
    usageCount: { type: Number, default: 0 }
}, { timestamps: true });

// Export all models
export const SiteConfig = mongoose.model('SiteConfig', siteConfigSchema);
export const PaymentGateway = mongoose.model('PaymentGateway', paymentGatewaySchema);
export const EmailSettings = mongoose.model('EmailSettings', emailSettingsSchema);
export const SmsSettings = mongoose.model('SmsSettings', smsSettingsSchema);
export const TaxConfig = mongoose.model('TaxConfig', taxConfigSchema);
export const ApiManagement = mongoose.model('ApiManagement', apiManagementSchema);
export const UserPermissions = mongoose.model('UserPermissions', userPermissionsSchema);
export const SecuritySettings = mongoose.model('SecuritySettings', securitySettingsSchema);
export const GdprCompliance = mongoose.model('GdprCompliance', gdprComplianceSchema);
export const DataBackup = mongoose.model('DataBackup', dataBackupSchema);
export const BackupSettings = mongoose.model('BackupSettings', backupSettingsSchema);
export const PersonalizationTools = mongoose.model('PersonalizationTools', personalizationToolsSchema);
export const MessageTemplate = mongoose.model('MessageTemplate', messageTemplateSchema);
export const CustomizationSettings = mongoose.model('CustomizationSettings', customizationSettingsSchema);
export const GreetingCard = mongoose.model('GreetingCard', greetingCardSchema);
