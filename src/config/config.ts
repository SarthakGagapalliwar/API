import { config as conf } from "dotenv";

conf();

const _config = {
  port: Number(process.env.PORT) || 3000,
  databaseUrl: process.env.MONGO_CONNECTION_STRING
};
export const config = Object.freeze(_config); //to read only
