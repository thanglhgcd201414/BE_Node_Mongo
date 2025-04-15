import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import {
  deleteMany as deleteProducts,
  insertMany as insertProducts,
} from "../models/product";
import { Category } from "../models/category";
import { env } from "@/common/utils/envConfig";
import { logger } from "@/server";

const NUMBER_PRODUCTS_SEED = 30;

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

const generateFakeProducts = async (count: number) => {
  const categories = await Category.find().exec();
  const categoryIds = categories.map((c) => c._id);

  const brands = ["Apple", "Samsung", "Xiaomi", "Oppo", "Vivo"];
  const models = {
    Apple: ["iPhone 15 Pro", "iPhone 14", "iPhone SE"],
    Samsung: ["Galaxy S23", "Galaxy Z Flip", "Galaxy A54"],
    Xiaomi: ["Redmi Note 12", "Mi 13 Pro", "Poco X5"],
    Oppo: ["Find X5", "Reno 8", "A98"],
    Vivo: ["X90 Pro", "V27", "Y78"],
  };

  return Array.from({ length: count }).map(() => {
    const selectedBrand = faker.helpers.arrayElement(
      brands
    ) as keyof typeof models;
    const basePrice = faker.number.int({ min: 5000000, max: 30000000 });

    return {
      name: `${selectedBrand} ${faker.helpers.arrayElement(
        models[selectedBrand]
      )}`,
      description: faker.commerce.productDescription(),
      brand: selectedBrand,
      productModel: faker.helpers.arrayElement(models[selectedBrand]),
      operatingSystem: getOSByBrand(selectedBrand),
      categories: faker.helpers.arrayElements(categoryIds, { min: 1, max: 2 }),
      images: Array.from({ length: 3 }, () => "/phone.png"),
      variants: generateVariants(basePrice),
    };
  });
};

const generateVariants = (basePrice: number) => {
  const storageOptions = ["32G", "64GB", "128GB", "256GB", "512GB", "1TB"];
  const colors = ["Black", "White", "Blue", "Green", "Gold"];

  return Array.from({ length: faker.number.int({ min: 2, max: 4 }) }, () => {
    const originalPrice =
      basePrice +
      Math.round((basePrice * faker.number.int({ min: 5, max: 15 })) / 100);
    const priceDiscount = faker.number.int({ min: 5, max: 20 });
    const price =
      originalPrice - Math.round(originalPrice * (priceDiscount / 100));

    return {
      sku: faker.string.uuid().substring(0, 8).toUpperCase(),
      stock: faker.number.int({ min: 50, max: 200 }),
      price: price,
      originalPrice: originalPrice,
      color: faker.helpers.arrayElement(colors),
      storageCapacity: faker.helpers.arrayElement(storageOptions),
      specifications: [
        {
          key: "Màn hình",
          value: `${faker.number
            .float({ min: 6.1, max: 6.7 })
            .toFixed(1)} inch`,
        },
        {
          key: "Chip",
          value: faker.helpers.arrayElement([
            "A16 Bionic",
            "Snapdragon 8 Gen 2",
            "Dimensity 9000",
          ]),
        },
        {
          key: "RAM",
          value: `${faker.helpers.arrayElement(["8GB", "12GB"])} GB`,
        },
        {
          key: "Camera",
          value: `${faker.number.int({ min: 12, max: 108 })} MP`,
        },
      ],
    };
  });
};

const getOSByBrand = (
  brand: "Apple" | "Samsung" | "Xiaomi" | "Oppo" | "Vivo"
) => {
  const osMapping = {
    Apple: "iOS",
    Samsung: "Android",
    Xiaomi: "Android",
    Oppo: "Android",
    Vivo: "Android",
  };
  return osMapping[brand] || "Android";
};

const seedProducts = async () => {
  await connectDB();
  await deleteProducts();

  const products = await generateFakeProducts(NUMBER_PRODUCTS_SEED);
  await insertProducts(products);
  logger.info("Inserted products successfully");

  mongoose.connection.close();
};

export default seedProducts;
