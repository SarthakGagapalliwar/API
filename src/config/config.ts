import { config as conf } from "dotenv";


conf();

const _config = {
  port: Number(process.env.PORT) || 3000,
  databaseUrl: process.env.MONGO_CONNECTION_STRING,
  env:process.env.NODE_ENV,
  jwtSecret :process.env.JWT_SECRET,
  cloudinarycloud:process.env.CLOUDINARY_CLOUD,
  cloudinaryApiKey:process.env.CLOUDINARY_API_KEY,
  cloudinarySecret:process.env.CLOUDINARY_API_SECRET,
};
export const config = Object.freeze(_config); //to read only
