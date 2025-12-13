import {
    VendorMessage,
    SupportTicket,
    Announcement,
    EmailTemplate,
    SmsTemplate,
    HelpDoc,
    TrainingResource,
    SystemStatus,
    ChatSession
} from "../model/supportModel.js";

// ============ GET ALL SUPPORT DATA ============
export const getAllSupportData = async (req, res) => {
    try {
        const [
            vendorMessages,
            supportTickets,
            chatSessions,
            announcements,
            emailTemplates,
            smsTemplates,
            helpDocs,
            trainingResources,
            systemStatuses
        ] = await Promise.all([
            VendorMessage.find().sort({ createdAt: -1 }).limit(50),
            SupportTicket.find().sort({ createdAt: -1 }).limit(100),
            ChatSession.find({ status: { $ne: 'closed' } }).sort({ createdAt: -1 }).limit(50),
            Announcement.find({ isActive: true }).sort({ createdAt: -1 }),
            EmailTemplate.find().sort({ createdAt: -1 }),
            SmsTemplate.find().sort({ createdAt: -1 }),
            HelpDoc.find({ isPublished: true }).sort({ createdAt: -1 }),
            TrainingResource.find({ isActive: true }).sort({ createdAt: -1 }),
            SystemStatus.find()
        ]);

        // Convert system statuses array to object
        const systemStatus = {};
        systemStatuses.forEach(s => {
            systemStatus[s.service] = s.status;
        });

        // Initialize default system statuses if empty
        if (Object.keys(systemStatus).length === 0) {
            const defaultServices = ['api', 'database', 'payments', 'notifications', 'cdn'];
            for (const service of defaultServices) {
                await SystemStatus.findOneAndUpdate(
                    { service },
                    { service, status: 'operational' },
                    { upsert: true }
                );
                systemStatus[service] = 'operational';
            }
        }

        res.status(200).json({
            success: true,
            vendorMessages,
            supportTickets,
            chatSessions,
            announcements,
            emailTemplates,
            smsTemplates,
            helpDocs,
            trainingResources,
            systemStatus
        });
    } catch (error) {
        console.error("Get All Support Data Error:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// ============ VENDOR MESSAGES ============
export const getVendorMessages = async (req, res) => {
    try {
        const { status } = req.query;
        let query = {};
        if (status && status !== 'all') query.status = status;

        const messages = await VendorMessage.find(query).sort({ createdAt: -1 });
        res.status(200).json({ success: true, messages });
    } catch (error) {
        console.error("Get Vendor Messages Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const replyToVendorMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { message } = req.body;

        const vendorMessage = await VendorMessage.findById(id);
        if (!vendorMessage) {
            return res.status(404).json({ success: false, message: "Message not found" });
        }

        vendorMessage.replies.push({ message, isAdmin: true });
        vendorMessage.status = 'replied';
        await vendorMessage.save();

        res.status(200).json({ success: true, message: "Reply sent", vendorMessage });
    } catch (error) {
        console.error("Reply to Vendor Message Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const updateMessageStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const message = await VendorMessage.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!message) {
            return res.status(404).json({ success: false, message: "Message not found" });
        }

        res.status(200).json({ success: true, message });
    } catch (error) {
        console.error("Update Message Status Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ============ SUPPORT TICKETS ============
export const getSupportTickets = async (req, res) => {
    try {
        const { status, priority } = req.query;
        let query = {};
        if (status && status !== 'all') query.status = status;
        if (priority && priority !== 'all') query.priority = priority;

        const tickets = await SupportTicket.find(query).sort({ createdAt: -1 });
        res.status(200).json({ success: true, tickets });
    } catch (error) {
        console.error("Get Support Tickets Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const createSupportTicket = async (req, res) => {
    try {
        const { customerName, email, phone, subject, description, priority, category } = req.body;

        const ticket = new SupportTicket({
            customerName,
            email,
            phone,
            subject,
            description,
            priority: priority || 'medium',
            category: category || 'general'
        });

        await ticket.save();
        res.status(201).json({ success: true, message: "Ticket created", ticket });
    } catch (error) {
        console.error("Create Support Ticket Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const updateTicketStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, assignedTo } = req.body;

        const updateData = { status };
        if (assignedTo) updateData.assignedTo = assignedTo;
        if (status === 'resolved') updateData.resolvedAt = new Date();

        const ticket = await SupportTicket.findByIdAndUpdate(id, updateData, { new: true });

        if (!ticket) {
            return res.status(404).json({ success: false, message: "Ticket not found" });
        }

        res.status(200).json({ success: true, ticket });
    } catch (error) {
        console.error("Update Ticket Status Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const replyToTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { message } = req.body;

        const ticket = await SupportTicket.findById(id);
        if (!ticket) {
            return res.status(404).json({ success: false, message: "Ticket not found" });
        }

        ticket.messages.push({ sender: 'admin', message });
        if (ticket.status === 'open') ticket.status = 'in-progress';
        await ticket.save();

        res.status(200).json({ success: true, message: "Reply added", ticket });
    } catch (error) {
        console.error("Reply to Ticket Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ============ ANNOUNCEMENTS ============
export const getAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, announcements });
    } catch (error) {
        console.error("Get Announcements Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const createAnnouncement = async (req, res) => {
    try {
        const { title, message, priority, targetAudience, expiresAt } = req.body;

        if (!title || !message) {
            return res.status(400).json({ success: false, message: "Title and message are required" });
        }

        const announcement = new Announcement({
            title,
            message,
            priority: priority || 'normal',
            targetAudience: targetAudience || 'all',
            expiresAt
        });

        await announcement.save();
        res.status(201).json({ success: true, message: "Announcement created", announcement });
    } catch (error) {
        console.error("Create Announcement Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const updateAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const announcement = await Announcement.findByIdAndUpdate(id, updateData, { new: true });

        if (!announcement) {
            return res.status(404).json({ success: false, message: "Announcement not found" });
        }

        res.status(200).json({ success: true, announcement });
    } catch (error) {
        console.error("Update Announcement Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const announcement = await Announcement.findByIdAndDelete(id);

        if (!announcement) {
            return res.status(404).json({ success: false, message: "Announcement not found" });
        }

        res.status(200).json({ success: true, message: "Announcement deleted" });
    } catch (error) {
        console.error("Delete Announcement Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ============ EMAIL TEMPLATES ============
export const getEmailTemplates = async (req, res) => {
    try {
        const templates = await EmailTemplate.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, templates });
    } catch (error) {
        console.error("Get Email Templates Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const createEmailTemplate = async (req, res) => {
    try {
        const { name, subject, body, type } = req.body;

        if (!name || !subject || !body) {
            return res.status(400).json({ success: false, message: "Name, subject, and body are required" });
        }

        // Extract variables from body (e.g., {{name}})
        const variableRegex = /\{\{(\w+)\}\}/g;
        const variables = [...body.matchAll(variableRegex)].map(m => `{{${m[1]}}}`);

        const template = new EmailTemplate({
            name,
            subject,
            body,
            type: type || 'general',
            variables
        });

        await template.save();
        res.status(201).json({ success: true, message: "Email template created", template });
    } catch (error) {
        console.error("Create Email Template Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const updateEmailTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Re-extract variables if body changed
        if (updateData.body) {
            const variableRegex = /\{\{(\w+)\}\}/g;
            updateData.variables = [...updateData.body.matchAll(variableRegex)].map(m => `{{${m[1]}}}`);
        }

        const template = await EmailTemplate.findByIdAndUpdate(id, updateData, { new: true });

        if (!template) {
            return res.status(404).json({ success: false, message: "Template not found" });
        }

        res.status(200).json({ success: true, template });
    } catch (error) {
        console.error("Update Email Template Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const deleteEmailTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const template = await EmailTemplate.findByIdAndDelete(id);

        if (!template) {
            return res.status(404).json({ success: false, message: "Template not found" });
        }

        res.status(200).json({ success: true, message: "Email template deleted" });
    } catch (error) {
        console.error("Delete Email Template Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ============ SMS TEMPLATES ============
export const getSmsTemplates = async (req, res) => {
    try {
        const templates = await SmsTemplate.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, templates });
    } catch (error) {
        console.error("Get SMS Templates Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const createSmsTemplate = async (req, res) => {
    try {
        const { name, message, type } = req.body;

        if (!name || !message) {
            return res.status(400).json({ success: false, message: "Name and message are required" });
        }

        // Extract variables from message
        const variableRegex = /\{\{(\w+)\}\}/g;
        const variables = [...message.matchAll(variableRegex)].map(m => `{{${m[1]}}}`);

        const template = new SmsTemplate({
            name,
            message,
            type: type || 'general',
            variables
        });

        await template.save();
        res.status(201).json({ success: true, message: "SMS template created", template });
    } catch (error) {
        console.error("Create SMS Template Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const updateSmsTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (updateData.message) {
            const variableRegex = /\{\{(\w+)\}\}/g;
            updateData.variables = [...updateData.message.matchAll(variableRegex)].map(m => `{{${m[1]}}}`);
        }

        const template = await SmsTemplate.findByIdAndUpdate(id, updateData, { new: true });

        if (!template) {
            return res.status(404).json({ success: false, message: "Template not found" });
        }

        res.status(200).json({ success: true, template });
    } catch (error) {
        console.error("Update SMS Template Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const deleteSmsTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const template = await SmsTemplate.findByIdAndDelete(id);

        if (!template) {
            return res.status(404).json({ success: false, message: "Template not found" });
        }

        res.status(200).json({ success: true, message: "SMS template deleted" });
    } catch (error) {
        console.error("Delete SMS Template Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ============ HELP DOCUMENTATION ============
export const getHelpDocs = async (req, res) => {
    try {
        const { category } = req.query;
        let query = { isPublished: true };
        if (category && category !== 'all') query.category = category;

        const docs = await HelpDoc.find(query).sort({ createdAt: -1 });
        res.status(200).json({ success: true, docs });
    } catch (error) {
        console.error("Get Help Docs Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const createHelpDoc = async (req, res) => {
    try {
        const { title, content, category, tags } = req.body;

        if (!title || !content) {
            return res.status(400).json({ success: false, message: "Title and content are required" });
        }

        const doc = new HelpDoc({
            title,
            content,
            category: category || 'general',
            tags: tags || []
        });

        await doc.save();
        res.status(201).json({ success: true, message: "Help document created", doc });
    } catch (error) {
        console.error("Create Help Doc Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const updateHelpDoc = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const doc = await HelpDoc.findByIdAndUpdate(id, updateData, { new: true });

        if (!doc) {
            return res.status(404).json({ success: false, message: "Document not found" });
        }

        res.status(200).json({ success: true, doc });
    } catch (error) {
        console.error("Update Help Doc Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const deleteHelpDoc = async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await HelpDoc.findByIdAndDelete(id);

        if (!doc) {
            return res.status(404).json({ success: false, message: "Document not found" });
        }

        res.status(200).json({ success: true, message: "Help document deleted" });
    } catch (error) {
        console.error("Delete Help Doc Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const incrementHelpDocViews = async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await HelpDoc.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true });

        if (!doc) {
            return res.status(404).json({ success: false, message: "Document not found" });
        }

        res.status(200).json({ success: true, doc });
    } catch (error) {
        console.error("Increment Help Doc Views Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ============ TRAINING RESOURCES ============
export const getTrainingResources = async (req, res) => {
    try {
        const { type } = req.query;
        let query = { isActive: true };
        if (type && type !== 'all') query.type = type;

        const resources = await TrainingResource.find(query).sort({ createdAt: -1 });
        res.status(200).json({ success: true, resources });
    } catch (error) {
        console.error("Get Training Resources Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const createTrainingResource = async (req, res) => {
    try {
        const { title, description, type, url, duration, pages, thumbnail } = req.body;

        if (!title || !url) {
            return res.status(400).json({ success: false, message: "Title and URL are required" });
        }

        const resource = new TrainingResource({
            title,
            description,
            type: type || 'video',
            url,
            duration,
            pages,
            thumbnail
        });

        await resource.save();
        res.status(201).json({ success: true, message: "Training resource created", resource });
    } catch (error) {
        console.error("Create Training Resource Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const updateTrainingResource = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const resource = await TrainingResource.findByIdAndUpdate(id, updateData, { new: true });

        if (!resource) {
            return res.status(404).json({ success: false, message: "Resource not found" });
        }

        res.status(200).json({ success: true, resource });
    } catch (error) {
        console.error("Update Training Resource Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const deleteTrainingResource = async (req, res) => {
    try {
        const { id } = req.params;
        const resource = await TrainingResource.findByIdAndDelete(id);

        if (!resource) {
            return res.status(404).json({ success: false, message: "Resource not found" });
        }

        res.status(200).json({ success: true, message: "Training resource deleted" });
    } catch (error) {
        console.error("Delete Training Resource Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ============ SYSTEM STATUS ============
export const getSystemStatus = async (req, res) => {
    try {
        const statuses = await SystemStatus.find();
        const statusObj = {};
        statuses.forEach(s => {
            statusObj[s.service] = s.status;
        });
        res.status(200).json({ success: true, systemStatus: statusObj });
    } catch (error) {
        console.error("Get System Status Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const updateSystemStatus = async (req, res) => {
    try {
        const { service, status, message } = req.body;

        const systemStatus = await SystemStatus.findOneAndUpdate(
            { service },
            { status, message, lastChecked: new Date() },
            { upsert: true, new: true }
        );

        res.status(200).json({ success: true, systemStatus });
    } catch (error) {
        console.error("Update System Status Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ============ CONTACT VENDORS (BULK MESSAGING) ============
export const sendBulkEmail = async (req, res) => {
    try {
        const { recipients, subject, message } = req.body;

        // In a real implementation, this would integrate with an email service
        // For now, we'll just log and return success
        console.log(`Sending bulk email to ${recipients} vendors: ${subject}`);

        res.status(200).json({
            success: true,
            message: `Email queued for sending to ${recipients} vendors`
        });
    } catch (error) {
        console.error("Send Bulk Email Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const sendBulkSms = async (req, res) => {
    try {
        const { recipients, message } = req.body;

        // In a real implementation, this would integrate with an SMS service
        console.log(`Sending bulk SMS to ${recipients} vendors: ${message}`);

        res.status(200).json({
            success: true,
            message: `SMS queued for sending to ${recipients} vendors`
        });
    } catch (error) {
        console.error("Send Bulk SMS Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ============ CHAT SESSIONS ============
export const getChatSessions = async (req, res) => {
    try {
        const { status } = req.query;
        let query = {};
        if (status && status !== 'all') query.status = status;

        const sessions = await ChatSession.find(query).sort({ createdAt: -1 });

        const stats = {
            active: await ChatSession.countDocuments({ status: 'active' }),
            waiting: await ChatSession.countDocuments({ status: 'waiting' }),
            closed: await ChatSession.countDocuments({ status: 'closed' })
        };

        res.status(200).json({ success: true, sessions, stats });
    } catch (error) {
        console.error("Get Chat Sessions Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
