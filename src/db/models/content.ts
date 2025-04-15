import { logger } from "@/server";
import mongoose, { Document, Schema } from "mongoose";

interface IContent extends Document {
  title: string;
  thumbnail: string;
  description: string;
  slug: string;
  content?: any;
}

const contentSchema = new Schema<IContent>(
  {
    title: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    description: { type: String, required: true },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    content: {
      type: Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

const Content = mongoose.model<IContent>("Content", contentSchema);

const deleteMany = async () => {
  try {
    const result = await Content.deleteMany({});
    logger.info(`Deleted ${result.deletedCount} contents successfully`);
    return result;
  } catch (error) {
    logger.error("Delete failed:", error);
    throw error;
  }
};

const insertMany = async (contents: IContent[]) => {
  try {
    const result = await Content.insertMany(contents);
    logger.info(`Inserted ${result.length} contents successfully`);
    return result;
  } catch (error) {
    logger.error("Insert failed:", error);
    throw error;
  }
};

export { Content, deleteMany, insertMany };
export default Content;
