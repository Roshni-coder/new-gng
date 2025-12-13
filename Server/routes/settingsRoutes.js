import express from 'express';
import {
    getAllSettingsData,
    getSiteConfig,
    updateSiteConfig,
    getPaymentGateways,
    updatePaymentGateway,
    togglePaymentGateway,
    getEmailSettings,
    updateEmailSettings,
    testEmailSettings,
    getSmsSettings,
    updateSmsSettings,
    getTaxConfig,
    updateTaxConfig,
    getApiKeys,
    createApiKey,
    deleteApiKey,
    toggleApiKey,
    getRoles,
    createRole,
    updateRole,
    deleteRole,
    getSecuritySettings,
    updateSecuritySettings,
    getGdprSettings,
    updateGdprSettings,
    getBackups,
    createBackup,
    deleteBackup,
    getBackupSettings,
    updateBackupSettings,
    getPersonalization,
    updatePersonalization,
    getMessageTemplates,
    createMessageTemplate,
    updateMessageTemplate,
    deleteMessageTemplate,
    getCustomization,
    updateCustomization,
    getGreetingCards,
    createGreetingCard,
    updateGreetingCard,
    deleteGreetingCard
} from '../controller/settingsController.js';

const router = express.Router();

// Main data endpoint - gets all settings data in one call
router.get('/', getAllSettingsData);

// Site Configuration
router.get('/site-config', getSiteConfig);
router.put('/site-config', updateSiteConfig);

// Payment Gateways
router.get('/payment-gateways', getPaymentGateways);
router.put('/payment-gateway/:gateway', updatePaymentGateway);
router.put('/payment-gateway/:gateway/toggle', togglePaymentGateway);

// Email Settings
router.get('/email-settings', getEmailSettings);
router.put('/email-settings', updateEmailSettings);
router.post('/email-settings/test', testEmailSettings);

// SMS Settings
router.get('/sms-settings', getSmsSettings);
router.put('/sms-settings', updateSmsSettings);

// Tax Configuration
router.get('/tax-config', getTaxConfig);
router.put('/tax-config', updateTaxConfig);

// API Management
router.get('/api-keys', getApiKeys);
router.post('/api-key', createApiKey);
router.delete('/api-key/:id', deleteApiKey);
router.put('/api-key/:id/toggle', toggleApiKey);

// User Permissions / Roles
router.get('/roles', getRoles);
router.post('/role', createRole);
router.put('/role/:id', updateRole);
router.delete('/role/:id', deleteRole);

// Security Settings
router.get('/security', getSecuritySettings);
router.put('/security', updateSecuritySettings);

// GDPR Compliance
router.get('/gdpr', getGdprSettings);
router.put('/gdpr', updateGdprSettings);

// Data Backup
router.get('/backups', getBackups);
router.post('/backup', createBackup);
router.delete('/backup/:id', deleteBackup);
router.get('/backup-settings', getBackupSettings);
router.put('/backup-settings', updateBackupSettings);

// Personalization Tools
router.get('/personalization', getPersonalization);
router.put('/personalization', updatePersonalization);

// Message Templates
router.get('/message-templates', getMessageTemplates);
router.post('/message-template', createMessageTemplate);
router.put('/message-template/:id', updateMessageTemplate);
router.delete('/message-template/:id', deleteMessageTemplate);

// Customization Settings
router.get('/customization', getCustomization);
router.put('/customization', updateCustomization);

// Greeting Cards
router.get('/greeting-cards', getGreetingCards);
router.post('/greeting-card', createGreetingCard);
router.put('/greeting-card/:id', updateGreetingCard);
router.delete('/greeting-card/:id', deleteGreetingCard);

export default router;
