import GiftOption from '../model/GiftOption.js';

export const addGiftOption = async (req, res) => {
    try {
        const { name, type, price, description } = req.body;
        // Basic validation
        if (!name || !type || !price) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }

        let images = [];
        // If files are uploaded (using multer middleware in route)
        if (req.files && req.files.length > 0) {
            images = req.files.map(file => ({ url: file.path, public_id: file.filename }));
        }

        const newOption = new GiftOption({
            name,
            type,
            price,
            description,
            images
        });

        await newOption.save();

        res.status(201).json({ success: true, option: newOption });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const getGiftOptions = async (req, res) => {
    try {
        const { type } = req.query;
        let query = {};
        if (type) query.type = type;

        const options = await GiftOption.find(query);
        res.status(200).json({ success: true, options });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const deleteGiftOption = async (req, res) => {
    try {
        await GiftOption.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Option deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const updateGiftOption = async (req, res) => {
    try {
        const updatedOption = await GiftOption.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ success: true, option: updatedOption });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
