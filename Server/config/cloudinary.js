import { v2 as cloudinary } from 'cloudinary';

const connectcloudinary = () => {
  const {
    CLOUDINARY_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_SECRET_KEY
  } = process.env;

  if (!CLOUDINARY_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_SECRET_KEY) {
    throw new Error('Missing Cloudinary credentials. Please set CLOUDINARY_NAME, CLOUDINARY_API_KEY and CLOUDINARY_SECRET_KEY.');
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_SECRET_KEY,
    secure: true
  });

  console.log('✅ Cloudinary configured');
};

export default connectcloudinary;