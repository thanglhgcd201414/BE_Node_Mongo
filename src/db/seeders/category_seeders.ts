import mongoose from "mongoose";
import pino from "pino";
import { faker } from "@faker-js/faker";
import {
  deleteMany as deleteCategories,
  insertMany as insertCategories,
} from "../models/category";
import { env } from "@/common/utils/envConfig";
import { logger } from "@/server";

const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      dbName: env.MONGODB_DB_NAME,
    });
    logger.info("Connected to Mongoose");
  } catch (error) {
    logger.error("Connect to Mongoose failed:", error);
    process.exit(1);
  }
};

const generateFakeCategories = (count = 10) => {
  const existingSlugs = new Set();
  const categories = [];

  while (categories.length < count) {
    const name = faker.commerce.department();
    const slug = faker.helpers.slugify(name.toLowerCase());

    if (!existingSlugs.has(slug)) {
      existingSlugs.add(slug);
      categories.push({
        name,
        description: faker.commerce.productDescription(),
        slug,
      });
    }
  }

  return categories;
};

const seedCategories = async () => {
  await connectDB();
  await deleteCategories();

  const categories = generateFakeCategories(10);
  await insertCategories(categories);
  logger.info("Inserted categories successfully");

  mongoose.connection.close();
};

export default seedCategories;
