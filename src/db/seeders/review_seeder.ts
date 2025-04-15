import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import Product from "../models/product";
import {
  deleteMany as deleteReviews,
  insertMany as insertReviews,
} from "../models/review";
import { User } from "../models/user";
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

const generateFakeReviews = async (products: any, min: number, max: number) => {
  const users = await User.find().exec();
  const userIds = users.map((u) => u._id);

  return products.flatMap((product: any) =>
    Array.from({ length: faker.number.int({ min: 3, max: 8 }) }).map(() => ({
      productId: product._id,
      userId: faker.helpers.arrayElement(userIds),
      rating: faker.number.int({ min, max }),
      comment: faker.lorem.sentence(),
    }))
  );
};

const seedReviews = async () => {
  await connectDB();
  await deleteReviews();
  const products = await Product.find().exec();

  const shuffledProducts = products.sort(() => 0.5 - Math.random());
  const highRatedCount = Math.ceil(shuffledProducts.length / 3);
  const highRatedProducts = shuffledProducts.slice(0, highRatedCount);
  const otherProducts = shuffledProducts.slice(highRatedCount);

  const reviewsHigh = await generateFakeReviews(highRatedProducts, 5, 5);
  const reviewsOther = await generateFakeReviews(otherProducts, 1, 5);
  const allReviews = [...reviewsHigh, ...reviewsOther];

  const insertedReviews = await insertReviews(allReviews);

  const reviewsByProductId = insertedReviews.reduce(
    (acc: Record<string, mongoose.Types.ObjectId[]>, review) => {
      const productId = review.productId.toString();
      if (!acc[productId]) {
        acc[productId] = [];
      }
      acc[productId].push(review._id as mongoose.Types.ObjectId);
      return acc;
    },
    {}
  );

  const bulkOps = Object.entries(reviewsByProductId).map(
    ([productId, reviewIds]) => ({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(productId) },
        update: {
          $push: {
            reviews: {
              $each: reviewIds,
            },
          },
        },
      },
    })
  );

  if (bulkOps.length > 0) {
    const bulkResult = await Product.bulkWrite(bulkOps);
    logger.info(
      `Updated ${bulkResult.modifiedCount} products with new reviews`
    );
  } else {
    logger.warn("No reviews to update in products");
  }

  logger.info(`Inserted ${insertedReviews.length} reviews successfully`);
  logger.info(`${highRatedProducts.length} products have all reviews > 4`);
  logger.info(`${otherProducts.length} products have mixed reviews`);

  mongoose.connection.close();
};

export default seedReviews;
