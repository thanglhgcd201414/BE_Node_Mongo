import mongoose from "mongoose";
import { deleteMany, insertMany } from "../models/user";
import { faker } from "@faker-js/faker";
import { Cart } from "../models/cart";
import { env } from "@/common/utils/envConfig";
import { logger } from "@/server";
import bcrypt from "bcrypt";

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

const hashPassword = (password: string): string => {
  return bcrypt.hashSync(password, 10);
};

const generateFakeUsers = (count = 3) => {
  return Array.from({ length: count }).map(() => ({
    email: faker.internet.email(),
    password: hashPassword(faker.internet.password()),
    role: faker.helpers.arrayElement(["USER", "ADMIN"]),
    name: faker.person.fullName(),
  }));
};

const seedUsers = async () => {
  await connectDB();
  await deleteMany();
  await Cart.deleteMany();

  const users = [
    {
      email: "admin@gmail.com",
      password: hashPassword("password"),
      role: "ADMIN",
      name: "Super Admin",
    },
    {
      email: "user1@gmail.com",
      password: hashPassword("password"),
      role: "USER",
      name: "Super Admin",
    },
    ...generateFakeUsers(3),
  ];

  const insertedUsers = await insertMany(users);
  logger.info("Inserted users successfully");

  const usersWithCart = insertedUsers.filter((user) => user.role === "USER");
  await Promise.all(
    usersWithCart.map((user) =>
      Cart.updateOne(
        { userId: user._id },
        { $setOnInsert: { items: [] } },
        { upsert: true }
      )
    )
  );

  logger.info(`Created carts for ${usersWithCart.length} users`);

  mongoose.connection.close();
};

export default seedUsers;
