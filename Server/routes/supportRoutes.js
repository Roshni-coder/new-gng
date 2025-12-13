import express from 'express';
import {
    getAllSupportData,
    getVendorMessages,
    replyToVendorMessage,
    updateMessageStatus,
    getSupportTickets,
    createSupportTicket,
    updateTicketStatus,
    replyToTicket,
    getAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    getEmailTemplates,
    createEmailTemplate,
    updateEmailTemplate,
    deleteEmailTemplate,
    getSmsTemplates,
    createSmsTemplate,
    updateSmsTemplate,
    deleteSmsTemplate,
    getHelpDocs,
    createHelpDoc,
    updateHelpDoc,
    deleteHelpDoc,
    incrementHelpDocViews,
    getTrainingResources,
    createTrainingResource,
    updateTrainingResource,
    deleteTrainingResource,
    getSystemStatus,
    updateSystemStatus,
    sendBulkEmail,
    sendBulkSms,
    getChatSessions
} from '../controller/supportController.js';

const router = express.Router();

// Main data endpoint - gets all support data in one call
router.get('/', getAllSupportData);

// Vendor Messages
router.get('/vendor-messages', getVendorMessages);
router.post('/vendor-messages/:id/reply', replyToVendorMessage);
router.put('/vendor-messages/:id/status', updateMessageStatus);

// Support Tickets
router.get('/tickets', getSupportTickets);
router.post('/tickets', createSupportTicket);
router.put('/ticket/:id', updateTicketStatus);
router.post('/ticket/:id/reply', replyToTicket);

// Announcements
router.get('/announcements', getAnnouncements);
router.post('/announcement', createAnnouncement);
router.put('/announcement/:id', updateAnnouncement);
router.delete('/announcement/:id', deleteAnnouncement);

// Email Templates
router.get('/email-templates', getEmailTemplates);
router.post('/email-template', createEmailTemplate);
router.put('/email-template/:id', updateEmailTemplate);
router.delete('/email-template/:id', deleteEmailTemplate);

// SMS Templates
router.get('/sms-templates', getSmsTemplates);
router.post('/sms-template', createSmsTemplate);
router.put('/sms-template/:id', updateSmsTemplate);
router.delete('/sms-template/:id', deleteSmsTemplate);

// Help Documentation
router.get('/help-docs', getHelpDocs);
router.post('/help-doc', createHelpDoc);
router.put('/help-doc/:id', updateHelpDoc);
router.delete('/help-doc/:id', deleteHelpDoc);
router.post('/help-doc/:id/view', incrementHelpDocViews);

// Training Resources
router.get('/training-resources', getTrainingResources);
router.post('/training-resource', createTrainingResource);
router.put('/training-resource/:id', updateTrainingResource);
router.delete('/training-resource/:id', deleteTrainingResource);

// System Status
router.get('/system-status', getSystemStatus);
router.put('/system-status', updateSystemStatus);

// Bulk Messaging (Contact Vendors)
router.post('/bulk-email', sendBulkEmail);
router.post('/bulk-sms', sendBulkSms);

// Chat Sessions
router.get('/chat-sessions', getChatSessions);

export default router;
