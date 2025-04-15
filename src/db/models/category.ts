import { logger } from "@/server";
import mongoose, { Document, Schema } from "mongoose";

interface ICategory extends Document {
  name: string;
  description?: string;
  slug: string;
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

const Category = mongoose.model<ICategory>("Category", categorySchema);

const deleteMany = async () => {
  try {
    const result = await Category.deleteMany({});
    logger.info(`Deleted ${result.deletedCount} categories successfully`);
    return result;
  } catch (error) {
    logger.error("Delete failed:", error);
    throw error;
  }
};

const insertMany = async (categories: any) => {
  try {
    const result = await Category.insertMany(categories);
    logger.info(`Inserted ${result.length} categories successfully`);
    return result;
  } catch (error) {
    logger.error("Insert failed:", error);
    throw error;
  }
};

export { Category, deleteMany, insertMany };
export default Category;
