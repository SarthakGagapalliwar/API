import { config } from "./config";
import mongoose from "mongoose";

const connectDB = async () => {
  const databaseUrl = config.databaseUrl;

  if (!databaseUrl) {
    throw new Error(
      "Database connection string is missing. Please set MONGO_CONNECTION_STRING."
    );
  }

  try {
    mongoose.connection.on("connected", () => {
      console.log("Database connection established ✔️");
    });

    mongoose.connection.on("error", (err) => {
      console.error("Error connecting to database:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("Database connection disconnected.");
    });

    await mongoose.connect(databaseUrl);
  } catch (err) {
    console.error("Failed to connect to database", err);
    process.exit(1);
  }
};

export default connectDB;
