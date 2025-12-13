import express from 'express';
import { addGiftOption, getGiftOptions, deleteGiftOption, updateGiftOption } from '../controller/giftController.js';
import adminAuth from '../middleware/authAdmin.js';
import upload from '../middleware/multer.js';

const router = express.Router();

router.post('/add', adminAuth, upload.array('images', 5), addGiftOption);
router.get('/all', adminAuth, getGiftOptions);
router.delete('/delete/:id', adminAuth, deleteGiftOption);
router.put('/update/:id', adminAuth, upload.array('images', 5), updateGiftOption);

export default router;
