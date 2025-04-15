import { env } from "@/common/utils/envConfig";
import { logger } from "@/server";
import { default as mongoose } from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      dbName: env.MONGODB_DB_NAME,
    });
    logger.info("MongoDB connection is established");
  } catch (err) {
    logger.error("MongoDB connection is failed:", err);
    process.exit(1);
  }
};

export default connectDB;
