import { logger } from "@/server";
import mongoose, { Document, Schema } from "mongoose";

interface IReview extends Document {
  productId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
}

const reviewSchema = new Schema<IReview>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
    },
  },
  { timestamps: true }
);

const Review = mongoose.model<IReview>("Review", reviewSchema);

const deleteMany = async () => {
  try {
    const result = await Review.deleteMany({});
    logger.info(`Deleted ${result.deletedCount} reviews successfully`);
    return result;
  } catch (error) {
    logger.error("Delete failed:", error);
    throw error;
  }
};

const insertMany = async (reviews: IReview[]) => {
  try {
    const result = await Review.insertMany(reviews);
    logger.info(`Inserted ${result.length} reviews successfully`);
    return result;
  } catch (error) {
    logger.error("Insert failed:", error);
    throw error;
  }
};

export { Review, deleteMany, insertMany };
