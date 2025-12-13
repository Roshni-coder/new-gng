import express from "express";
import adminAuth from "../middleware/authAdmin.js";
import {
    getAllShippingSettings,
    updateAllShippingSettings,
    getDeliveryPartners,
    updateDeliveryPartners,
    getShippingRates,
    updateShippingRates,
    getShippingSettings,
    updateShippingSettings,
    getPackageDimensions,
    updatePackageDimensions
} from "../controller/shippingController.js";

const router = express.Router();

// Use adminAuth for all these routes
// NOTE: Admin needs to pass 'sellerId' in body if they want to edit a specific seller,
// OR we use a convention for 'Platform Defaults'. 
// For now, let's assume Admin edits their OWN settings (global platform settings) 
// or we inject a specific ID.
// The controller looks primarily at req.sellerId (from token) OR req.body.sellerId.
// adminAuth sets req.adminId, NOT req.sellerId. 
// So Admin MUST pass query param or body param for sellerId, or we default to "PLATFORM_ADMIN".

const injectAdminSellerId = (req, res, next) => {
    if (!req.body.sellerId) {
        req.body.sellerId = "000000000000000000000000";
    }
    next();
};


router.get("/all-settings", adminAuth, injectAdminSellerId, getAllShippingSettings);
router.post("/all-settings", adminAuth, injectAdminSellerId, updateAllShippingSettings);

router.get("/partners", adminAuth, injectAdminSellerId, getDeliveryPartners);
router.post("/partners", adminAuth, injectAdminSellerId, updateDeliveryPartners);

router.get("/rates", adminAuth, injectAdminSellerId, getShippingRates);
router.post("/rates", adminAuth, injectAdminSellerId, updateShippingRates);

router.get("/dimensions", adminAuth, injectAdminSellerId, getPackageDimensions);
router.post("/dimensions", adminAuth, injectAdminSellerId, updatePackageDimensions);

export default router;
