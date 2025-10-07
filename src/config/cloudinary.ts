import { v2 as cloudinary } from 'cloudinary'
import { config } from './config';

cloudinary.config({ 
  cloud_name: config.cloudinarycloud, 
  api_key: config.cloudinaryApiKey, 
  api_secret: config.cloudinarySecret,
});

export default cloudinary;