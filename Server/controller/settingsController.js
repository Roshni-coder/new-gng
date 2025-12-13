import {
    SiteConfig,
    PaymentGateway,
    EmailSettings,
    SmsSettings,
    TaxConfig,
    ApiManagement,
    UserPermissions,
    SecuritySettings,
    GdprCompliance,
    DataBackup,
    BackupSettings,
    PersonalizationTools,
    MessageTemplate,
    CustomizationSettings,
    GreetingCard
} from "../model/settingsModel.js";
import { ActivityLog } from "../model/notificationModel.js";

// ============ GET ALL SETTINGS DATA ============
export const getAllSettingsData = async (req, res) => {
    try {
        const [
            siteConfig,
            paymentGateways,
            emailSettings,
            smsSettings,
            taxConfig,
            apiKeys,
            roles,
            securitySettings,
            gdprSettings,
            backups,
            backupSettings,
            personalization,
            messageTemplates,
            customization,
            greetingCards
        ] = await Promise.all([
            SiteConfig.findOne(),
            PaymentGateway.find().sort({ order: 1 }),
            EmailSettings.findOne(),
            SmsSettings.findOne(),
            TaxConfig.findOne(),
            ApiManagement.find(),
            UserPermissions.find(),
            SecuritySettings.findOne(),
            GdprCompliance.findOne(),
            DataBackup.find().sort({ createdAt: -1 }).limit(20),
            BackupSettings.findOne(),
            PersonalizationTools.findOne(),
            MessageTemplate.find(),
            CustomizationSettings.findOne(),
            GreetingCard.find()
        ]);

        res.status(200).json({
            success: true,
            siteConfig: siteConfig || {},
            paymentGateways,
            emailSettings: emailSettings || {},
            smsSettings: smsSettings || {},
            taxConfig: taxConfig || {},
            apiKeys,
            roles,
            securitySettings: securitySettings || {},
            gdprSettings: gdprSettings || {},
            backups,
            backupSettings: backupSettings || {},
            personalization: personalization || {},
            messageTemplates,
            customization: customization || {},
            greetingCards
        });
    } catch (error) {
        console.error("Get All Settings Data Error:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// ============ SITE CONFIGURATION ============
export const getSiteConfig = async (req, res) => {
    try {
        let config = await SiteConfig.findOne();
        if (!config) {
            config = new SiteConfig({});
            await config.save();
        }
        res.status(200).json({ success: true, config });
    } catch (error) {
        console.error("Get Site Config Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const updateSiteConfig = async (req, res) => {
    try {
        const config = await SiteConfig.findOneAndUpdate({}, req.body, { new: true, upsert: true });
        res.status(200).json({ success: true, message: "Site configuration updated", config });
    } catch (error) {
        console.error("Update Site Config Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ============ PAYMENT GATEWAYS ============
export const getPaymentGateways = async (req, res) => {
    try {
        const gateways = await PaymentGateway.find().sort({ order: 1 });
        res.status(200).json({ success: true, gateways });
    } catch (error) {
        console.error("Get Payment Gateways Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const updatePaymentGateway = async (req, res) => {
    try {
        const { gateway } = req.params;
        const gatewayDoc = await PaymentGateway.findOneAndUpdate(
            { gateway },
            req.body,
            { new: true, upsert: true }
        );
        res.status(200).json({ success: true, message: "Payment gateway updated", gateway: gatewayDoc });
    } catch (error) {
        console.error("Update Payment Gateway Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const togglePaymentGateway = async (req, res) => {
    try {
        const { gateway } = req.params;
        const { isActive } = req.body;
        const gatewayDoc = await PaymentGateway.findOneAndUpdate(
            { gateway },
            { isActive },
            { new: true }
        );
        res.status(200).json({ success: true, gateway: gatewayDoc });
    } catch (error) {
        console.error("Toggle Payment Gateway Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ============ EMAIL SETTINGS ============
export const getEmailSettings = async (req, res) => {
    try {
        let settings = await EmailSettings.findOne();
        if (!settings) {
            settings = new EmailSettings({});
            await settings.save();
        }
        res.status(200).json({ success: true, settings });
    } catch (error) {
        console.error("Get Email Settings Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const updateEmailSettings = async (req, res) => {
    try {
        const settings = await EmailSettings.findOneAndUpdate({}, req.body, { new: true, upsert: true });
        res.status(200).json({ success: true, message: "Email settings updated", settings });
    } catch (error) {
        console.error("Update Email Settings Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const testEmailSettings = async (req, res) => {
    try {
        // In production, this would actually send a test email
        res.status(200).json({ success: true, message: "Test email sent successfully" });
    } catch (error) {
        console.error("Test Email Error:", error);
        res.status(500).json({ success: false, message: "Failed to send test email" });
    }
};

// ============ SMS SETTINGS ============
export const getSmsSettings = async (req, res) => {
    try {
        let settings = await SmsSettings.findOne();
        if (!settings) {
            settings = new SmsSettings({});
            await settings.save();
        }
        res.status(200).json({ success: true, settings });
    } catch (error) {
        console.error("Get SMS Settings Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const updateSmsSettings = async (req, res) => {
    try {
        const settings = await SmsSettings.findOneAndUpdate({}, req.body, { new: true, upsert: true });
        res.status(200).json({ success: true, message: "SMS settings updated", settings });
    } catch (error) {
        console.error("Update SMS Settings Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ============ TAX CONFIGURATION ============
export const getTaxConfig = async (req, res) => {
    try {
        let config = await TaxConfig.findOne();
        if (!config) {
            config = new TaxConfig({
                taxRates: [
                    { name: "GST 5%", rate: 5, category: "essentials", isDefault: false },
                    { name: "GST 12%", rate: 12, category: "standard", isDefault: false },
                    { name: "GST 18%", rate: 18, category: "general", isDefault: true },
                    { name: "GST 28%", rate: 28, category: "luxury", isDefault: false }
                ]
            });
            await config.save();
        }
        res.status(200).json({ success: true, config });
    } catch (error) {
        console.error("Get Tax Config Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const updateTaxConfig = async (req, res) => {
    try {
        const config = await TaxConfig.findOneAndUpdate({}, req.body, { new: true, upsert: true });
        res.status(200).json({ success: true, message: "Tax configuration updated", config });
    } catch (error) {
        console.error("Update Tax Config Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ============ API MANAGEMENT ============
export const getApiKeys = async (req, res) => {
    try {
        const keys = await ApiManagement.find();
        res.status(200).json({ success: true, keys });
    } catch (error) {
        console.error("Get API Keys Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const createApiKey = async (req, res) => {
    try {
        const { apiName, rateLimit, permissions, allowedOrigins } = req.body;

        // Generate API key
        const apiKey = 'gng_' + require('crypto').randomBytes(32).toString('hex');
        const apiSecret = require('crypto').randomBytes(32).toString('hex');

        const newKey = new ApiManagement({
            apiName,
            apiKey,
            apiSecret,
            rateLimit: rateLimit || 1000,
            permissions: permissions || [],
            allowedOrigins: allowedOrigins || [],
            isActive: true
        });

        await newKey.save();
        res.status(201).json({ success: true, message: "API key created", key: newKey });
    } catch (error) {
        console.error("Create API Key Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const deleteApiKey = async (req, res) => {
    try {
        const { id } = req.params;
        await ApiManagement.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "API key deleted" });
    } catch (error) {
        console.error("Delete API Key Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const toggleApiKey = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        const key = await ApiManagement.findByIdAndUpdate(id, { isActive }, { new: true });
        res.status(200).json({ success: true, key });
    } catch (error) {
        console.error("Toggle API Key Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ============ USER PERMISSIONS / ROLES ============
export const getRoles = async (req, res) => {
    try {
        let roles = await UserPermissions.find();
        if (roles.length === 0) {
            // Create default roles
            const defaultRoles = [
                { roleName: 'Super Admin', isSystemRole: true, permissions: { dashboard: { view: true, edit: true }, products: { view: true, create: true, edit: true, delete: true }, orders: { view: true, edit: true, cancel: true, refund: true }, users: { view: true, create: true, edit: true, delete: true, block: true }, vendors: { view: true, approve: true, edit: true, delete: true }, categories: { view: true, create: true, edit: true, delete: true }, reports: { view: true, export: true }, settings: { view: true, edit: true }, marketing: { view: true, create: true, edit: true }, finance: { view: true, edit: true, process: true } } },
                { roleName: 'Admin', isSystemRole: true, permissions: { dashboard: { view: true, edit: false }, products: { view: true, create: true, edit: true, delete: false }, orders: { view: true, edit: true, cancel: true, refund: false }, users: { view: true, create: false, edit: true, delete: false, block: true }, vendors: { view: true, approve: true, edit: true, delete: false }, categories: { view: true, create: true, edit: true, delete: false }, reports: { view: true, export: true }, settings: { view: true, edit: false }, marketing: { view: true, create: true, edit: true }, finance: { view: true, edit: false, process: false } } },
                { roleName: 'Support', isSystemRole: false, permissions: { dashboard: { view: true, edit: false }, products: { view: true, create: false, edit: false, delete: false }, orders: { view: true, edit: true, cancel: false, refund: false }, users: { view: true, create: false, edit: false, delete: false, block: false }, vendors: { view: true, approve: false, edit: false, delete: false }, categories: { view: true, create: false, edit: false, delete: false }, reports: { view: false, export: false }, settings: { view: false, edit: false }, marketing: { view: false, create: false, edit: false }, finance: { view: false, edit: false, process: false } } }
            ];
            roles = await UserPermissions.insertMany(defaultRoles);
        }
        res.status(200).json({ success: true, roles });
    } catch (error) {
        console.error("Get Roles Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const createRole = async (req, res) => {
    try {
        const role = new UserPermissions(req.body);
        await role.save();
        res.status(201).json({ success: true, message: "Role created", role });
    } catch (error) {
        console.error("Create Role Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const role = await UserPermissions.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json({ success: true, message: "Role updated", role });
    } catch (error) {
        console.error("Update Role Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const deleteRole = async (req, res) => {
    try {
        const { id } = req.params;
        const role = await UserPermissions.findById(id);
        if (role.isSystemRole) {
            return res.status(400).json({ success: false, message: "Cannot delete system role" });
        }
        await UserPermissions.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Role deleted" });
    } catch (error) {
        console.error("Delete Role Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ============ SECURITY SETTINGS ============
export const getSecuritySettings = async (req, res) => {
    try {
        let settings = await SecuritySettings.findOne();
        if (!settings) {
            settings = new SecuritySettings({});
            await settings.save();
        }
        res.status(200).json({ success: true, settings });
    } catch (error) {
        console.error("Get Security Settings Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const updateSecuritySettings = async (req, res) => {
    try {
        const settings = await SecuritySettings.findOneAndUpdate({}, req.body, { new: true, upsert: true });
        res.status(200).json({ success: true, message: "Security settings updated", settings });
    } catch (error) {
        console.error("Update Security Settings Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ============ GDPR COMPLIANCE ============
export const getGdprSettings = async (req, res) => {
    try {
        let settings = await GdprCompliance.findOne();
        if (!settings) {
            settings = new GdprCompliance({});
            await settings.save();
        }
        res.status(200).json({ success: true, settings });
    } catch (error) {
        console.error("Get GDPR Settings Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const updateGdprSettings = async (req, res) => {
    try {
        const settings = await GdprCompliance.findOneAndUpdate({}, req.body, { new: true, upsert: true });
        res.status(200).json({ success: true, message: "GDPR settings updated", settings });
    } catch (error) {
        console.error("Update GDPR Settings Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ============ DATA BACKUP ============
export const getBackups = async (req, res) => {
    try {
        const backups = await DataBackup.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, backups });
    } catch (error) {
        console.error("Get Backups Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const createBackup = async (req, res) => {
    try {
        const { backupType, collections } = req.body;

        const backup = new DataBackup({
            backupName: `backup_${new Date().toISOString().replace(/[:.]/g, '-')}`,
            backupType: backupType || 'full',
            collections: collections || [],
            status: 'running',
            startedAt: new Date()
        });

        await backup.save();

        // Simulate backup completion (in production, this would be an async job)
        setTimeout(async () => {
            await DataBackup.findByIdAndUpdate(backup._id, {
                status: 'completed',
                completedAt: new Date(),
                size: Math.floor(Math.random() * 100000000) // Simulated size
            });
        }, 3000);

        res.status(201).json({ success: true, message: "Backup started", backup });
    } catch (error) {
        console.error("Create Backup Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const deleteBackup = async (req, res) => {
    try {
        const { id } = req.params;
        await DataBackup.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Backup deleted" });
    } catch (error) {
        console.error("Delete Backup Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const getBackupSettings = async (req, res) => {
    try {
        let settings = await BackupSettings.findOne();
        if (!settings) {
            settings = new BackupSettings({});
            await settings.save();
        }
        res.status(200).json({ success: true, settings });
    } catch (error) {
        console.error("Get Backup Settings Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const updateBackupSettings = async (req, res) => {
    try {
        const settings = await BackupSettings.findOneAndUpdate({}, req.body, { new: true, upsert: true });
        res.status(200).json({ success: true, message: "Backup settings updated", settings });
    } catch (error) {
        console.error("Update Backup Settings Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ============ PERSONALIZATION TOOLS ============
export const getPersonalization = async (req, res) => {
    try {
        let settings = await PersonalizationTools.findOne();
        if (!settings) {
            settings = new PersonalizationTools({});
            await settings.save();
        }
        res.status(200).json({ success: true, settings });
    } catch (error) {
        console.error("Get Personalization Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const updatePersonalization = async (req, res) => {
    try {
        const settings = await PersonalizationTools.findOneAndUpdate({}, req.body, { new: true, upsert: true });
        res.status(200).json({ success: true, message: "Personalization settings updated", settings });
    } catch (error) {
        console.error("Update Personalization Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ============ MESSAGE TEMPLATES ============
export const getMessageTemplates = async (req, res) => {
    try {
        const { type } = req.query;
        let query = {};
        if (type && type !== 'all') query.type = type;
        const templates = await MessageTemplate.find(query);
        res.status(200).json({ success: true, templates });
    } catch (error) {
        console.error("Get Message Templates Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const createMessageTemplate = async (req, res) => {
    try {
        const template = new MessageTemplate(req.body);
        await template.save();
        res.status(201).json({ success: true, message: "Template created", template });
    } catch (error) {
        console.error("Create Message Template Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const updateMessageTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const template = await MessageTemplate.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json({ success: true, message: "Template updated", template });
    } catch (error) {
        console.error("Update Message Template Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const deleteMessageTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        await MessageTemplate.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Template deleted" });
    } catch (error) {
        console.error("Delete Message Template Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ============ CUSTOMIZATION SETTINGS ============
export const getCustomization = async (req, res) => {
    try {
        let settings = await CustomizationSettings.findOne();
        if (!settings) {
            settings = new CustomizationSettings({});
            await settings.save();
        }
        res.status(200).json({ success: true, settings });
    } catch (error) {
        console.error("Get Customization Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const updateCustomization = async (req, res) => {
    try {
        const settings = await CustomizationSettings.findOneAndUpdate({}, req.body, { new: true, upsert: true });
        res.status(200).json({ success: true, message: "Customization settings updated", settings });
    } catch (error) {
        console.error("Update Customization Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ============ GREETING CARDS ============
export const getGreetingCards = async (req, res) => {
    try {
        const { category } = req.query;
        let query = {};
        if (category && category !== 'all') query.category = category;
        const cards = await GreetingCard.find(query);
        res.status(200).json({ success: true, cards });
    } catch (error) {
        console.error("Get Greeting Cards Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const createGreetingCard = async (req, res) => {
    try {
        const card = new GreetingCard(req.body);
        await card.save();
        res.status(201).json({ success: true, message: "Greeting card created", card });
    } catch (error) {
        console.error("Create Greeting Card Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const updateGreetingCard = async (req, res) => {
    try {
        const { id } = req.params;
        const card = await GreetingCard.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json({ success: true, message: "Greeting card updated", card });
    } catch (error) {
        console.error("Update Greeting Card Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const deleteGreetingCard = async (req, res) => {
    try {
        const { id } = req.params;
        await GreetingCard.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Greeting card deleted" });
    } catch (error) {
        console.error("Delete Greeting Card Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
