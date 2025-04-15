import { logger } from "@/server";
import mongoose, { Document, Schema } from "mongoose";
import "./review";

interface IVariants {
  sku: string;
  stock: number;
  price: number;
  originalPrice: number;
  color: string;
  storageCapacity: string;
  specifications: { key: string; value: string }[];
}

interface IProduct extends Document {
  name: string;
  description?: string;
  brand: string;
  productModel: string;
  categories: mongoose.Types.ObjectId[];
  variants: IVariants[];
  reviews: mongoose.Types.ObjectId[];
  images?: string[];
  embedding?: number[];
  operatingSystem?: string;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    brand: {
      type: String,
      required: true,
    },
    productModel: {
      type: String,
      required: true,
    },
    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    variants: [
      {
        sku: String,
        stock: Number,
        price: Number,
        originalPrice: Number,
        color: String,
        storageCapacity: String,
        specifications: [{ key: String, value: String }],
      },
    ],
    embedding: {
      type: [Number],
      index: "cosmosSearch",
      cosmosSearch: {
        kind: "vector-ivf",
        numLists: 100,
        similarity: "COS",
        dimensions: 768,
      },
      default: [],
    },
    images: [
      {
        type: String,
      },
    ],
    operatingSystem: {
      type: String,
    },
  },
  { timestamps: true }
);

productSchema.index(
  {
    brand: "text",
    productModel: "text",
    name: "text",
    description: "text",
  },
  {
    name: "full_text_search",
    weights: {
      brand: 5,
      productModel: 5,
      name: 3,
      description: 1,
    },
  }
);

productSchema.virtual("ratingAverage").get(function (this: IProduct) {
  if (!this.reviews || this.reviews.length === 0) return 0;
  const total = this.reviews.reduce(
    (sum, review) => sum + (review as any).rating,
    0
  );
  return Number((total / this.reviews.length).toFixed(1));
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

const Product = mongoose.model<IProduct>("Product", productSchema);

const deleteMany = async () => {
  try {
    const result = await Product.deleteMany({});
    logger.info(`Deleted ${result.deletedCount} products successfully`);
    return result;
  } catch (error) {
    logger.error("Delete failed:", error);
    throw error;
  }
};

const insertMany = async (products: any) => {
  try {
    const result = await Product.insertMany(products);
    logger.info(`Inserted ${result.length} products successfully`);
    return result;
  } catch (error) {
    logger.error("Insert failed:", error);
    throw error;
  }
};

export { Product, deleteMany, insertMany };
export default Product;
